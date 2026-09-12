import { GoogleGenAI, Type } from '@google/genai';

export interface SmartAiRequestOptions {
  model?: string;
  systemInstruction?: string;
  prompt: string;
  isJson?: boolean;
  jsonSchema?: any;
}

export interface SmartAiResponse {
  text: string;
  parsedJson?: any;
  usedModel: string;
  provider: string;
  executionPath: string[];
}

export const ALL_ALLOWED_FREE_MODELS = [
  // OpenCode Free (No Auth Native)
  'opencode/nemotron-3-ultra',
  'opencode/mimo-v2-pro',
  'opencode/mimo-v2-omni',
  'opencode/minimax-m2.5',
  'opencode/nemotron-3-super',
  // Google Gemini Free Tier
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  // OpenRouter / Public Free Tier
  'openrouter/free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'deepseek/deepseek-r1:free',
];

/**
 * Extract and parse JSON safely from any LLM output (handles backticks, preambles, and postambles)
 */
export function extractAndParseJson<T = any>(rawText: string): T {
  const trimmed = rawText.trim();
  
  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Strip markdown blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Find outer brackets { ... } or [ ... ]
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const candidate = trimmed.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  throw new Error(`Gagal mem-parse output model menjadi JSON yang valid:\n${trimmed.slice(0, 300)}...`);
}

/**
 * Native Upstream Caller 1: Direct OpenCode Zen API (The underlying OpenCode service)
 */
async function callOpenCodeZenUpstream(
  model: string,
  systemInstruction: string,
  prompt: string,
  isJson: boolean
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const cleanModel = model.replace('opencode/', '');
    const sysPrompt = isJson
      ? `${systemInstruction}\nOutput format MUST be valid RFC-8259 raw JSON only. No markdown formatting, no commentary.`
      : systemInstruction;

    const res = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenCode-Native-Router/1.0',
      },
      body: JSON.stringify({
        model: cleanModel,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch {}
  return null;
}

/**
 * Native Upstream Caller 2: Direct Pollinations / Public Zero-Auth OpenAI-compatible Gateway
 */
async function callPublicZeroAuthGateway(
  model: string,
  systemInstruction: string,
  prompt: string,
  isJson: boolean
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let mappedModel = 'openai';
    if (model.includes('deepseek') || model.includes('r1')) mappedModel = 'deepseek';
    else if (model.includes('qwen') || model.includes('coder')) mappedModel = 'qwen-coder';
    else if (model.includes('llama')) mappedModel = 'mistral';
    else if (model.includes('nemotron') || model.includes('mimo')) mappedModel = 'openai';

    const sysPrompt = isJson
      ? `${systemInstruction}\nReturn purely valid JSON strictly matching the schema with no surrounding text or backticks.`
      : systemInstruction;

    const res = await fetch('https://text.pollinations.ai/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: mappedModel,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        jsonMode: isJson,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch {}
  return null;
}

/**
 * Native Upstream Caller 3: Optional local proxy (if user explicitly provided NINEROUTER_URL or running locally)
 */
async function callLocalProxyIfAvailable(
  model: string,
  systemInstruction: string,
  prompt: string,
  isJson: boolean
): Promise<string | null> {
  const routerBaseUrl = process.env.NINEROUTER_URL;
  if (!routerBaseUrl) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${routerBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: isJson ? `${systemInstruction}\nOutput JSON only.` : systemInstruction },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch {}
  return null;
}

/**
 * Native Upstream Caller 4: Google Gemini Free Tier with Official SDK
 */
async function callGeminiNative(
  geminiModel: string,
  systemInstruction: string,
  prompt: string,
  isJson: boolean,
  jsonSchema?: any
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi pada environment variable.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-smart-router',
      },
    },
  });

  const config: any = {
    systemInstruction,
  };

  if (isJson) {
    config.responseMimeType = 'application/json';
    if (jsonSchema) {
      config.responseSchema = jsonSchema;
    }
  }

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: prompt,
    config,
  });

  const text = response?.text;
  if (!text) {
    throw new Error(`Empty response returned from Gemini (${geminiModel})`);
  }
  return text;
}

/**
 * Master Smart Router Execution Engine:
 * Implements 9router's intelligent multi-tier routing internally inside the backend.
 * No external proxy daemon required!
 */
export async function executeSmartAiRouting(options: SmartAiRequestOptions): Promise<SmartAiResponse> {
  const requestedModel = options.model && ALL_ALLOWED_FREE_MODELS.includes(options.model)
    ? options.model
    : 'gemini-3.8-flash';

  const systemInstruction = options.systemInstruction || 'You are an expert technical AI system architect.';
  const isJson = Boolean(options.isJson);
  const executionPath: string[] = [];

  // Check 1: If local proxy or custom NINEROUTER_URL is explicitly configured, check it first
  if (process.env.NINEROUTER_URL) {
    const proxyResult = await callLocalProxyIfAvailable(requestedModel, systemInstruction, options.prompt, isJson);
    if (proxyResult) {
      executionPath.push(`local-proxy:${process.env.NINEROUTER_URL}`);
      return {
        text: proxyResult,
        parsedJson: isJson ? extractAndParseJson(proxyResult) : undefined,
        usedModel: requestedModel,
        provider: 'Custom Local Proxy',
        executionPath,
      };
    }
  }

  // Check 2: If OpenCode model requested, execute OpenCode Native Direct Upstream
  if (requestedModel.startsWith('opencode/')) {
    executionPath.push('opencode-zen-upstream');
    const zenResult = await callOpenCodeZenUpstream(requestedModel, systemInstruction, options.prompt, isJson);
    if (zenResult) {
      try {
        const parsed = isJson ? extractAndParseJson(zenResult) : undefined;
        return {
          text: zenResult,
          parsedJson: parsed,
          usedModel: requestedModel,
          provider: 'OpenCode Native Free Upstream',
          executionPath,
        };
      } catch {
        // Fallthrough if output was malformed JSON
      }
    }

    // Check 2b: Fallback to Public Zero-Auth Gateway for OpenCode models
    executionPath.push('public-zero-auth-gateway');
    const gatewayResult = await callPublicZeroAuthGateway(requestedModel, systemInstruction, options.prompt, isJson);
    if (gatewayResult) {
      try {
        const parsed = isJson ? extractAndParseJson(gatewayResult) : undefined;
        return {
          text: gatewayResult,
          parsedJson: parsed,
          usedModel: requestedModel,
          provider: 'Public Zero-Auth Gateway',
          executionPath,
        };
      } catch {
        // Fallthrough to Gemini tier
      }
    }
  }

  // Check 3: If OpenRouter / Open-source model requested
  if (requestedModel.startsWith('openrouter/') || requestedModel.includes(':free')) {
    executionPath.push('public-zero-auth-gateway');
    const gatewayResult = await callPublicZeroAuthGateway(requestedModel, systemInstruction, options.prompt, isJson);
    if (gatewayResult) {
      try {
        const parsed = isJson ? extractAndParseJson(gatewayResult) : undefined;
        return {
          text: gatewayResult,
          parsedJson: parsed,
          usedModel: requestedModel,
          provider: 'Open-Source Free Gateway',
          executionPath,
        };
      } catch {}
    }
  }

  // Check 4: Google Gemini Free Tier Native Cascade
  // Cascade order: Target Gemini Model -> gemini-3.8-flash -> gemini-3.6-flash -> gemini-3.1-flash-lite
  const geminiModelsToTry = requestedModel.startsWith('gemini-')
    ? [requestedModel, 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']
    : ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];

  // Remove duplicate entries
  const uniqueGeminiModels = Array.from(new Set(geminiModelsToTry));

  let lastError: any = null;
  for (const gModel of uniqueGeminiModels) {
    executionPath.push(`gemini-native:${gModel}`);
    try {
      const gResult = await callGeminiNative(gModel, systemInstruction, options.prompt, isJson, options.jsonSchema);
      const parsed = isJson ? extractAndParseJson(gResult) : undefined;
      return {
        text: gResult,
        parsedJson: parsed,
        usedModel: gModel,
        provider: 'Google Gemini Free Tier',
        executionPath,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[Smart Router] Cascade failed for ${gModel}, switching to next model...`, err);
    }
  }

  throw new Error(`Smart AI Router gagal mengeksekusi permintaan pada semua jalur upstream: ${lastError?.message || 'Unknown error'}`);
}
