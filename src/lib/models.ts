export interface AiModelConfig {
  id: string;
  name: string;
  badge?: string;
  category: 'ultra' | 'reasoning' | 'fast' | 'code';
}

export const AI_MODELS_LIST: AiModelConfig[] = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', badge: 'Recommended', category: 'fast' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', badge: 'Ultra Fast', category: 'fast' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', badge: 'Auto Latest', category: 'fast' },
  { id: 'nemotron-3-ultra', name: 'Nemotron 3 Ultra', badge: 'Ultra Reasoning', category: 'ultra' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', badge: 'Deep Reasoning', category: 'reasoning' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', badge: 'Open Flagship', category: 'reasoning' },
  { id: 'qwen-2.5-coder', name: 'Qwen 2.5 Coder', badge: 'Code & Math', category: 'code' },
  { id: 'mimo-v2-pro', name: 'MiMo V2 Pro', badge: 'Balanced Pro', category: 'ultra' },
  { id: 'minimax-m2.5', name: 'MiniMax M2.5', badge: 'Creative', category: 'ultra' },
];

export function getCleanModelName(modelId: string): string {
  if (!modelId) return 'Gemini 3.8 Flash';
  const found = AI_MODELS_LIST.find(
    (m) => m.id === modelId || m.id === modelId.replace('opencode/', '').replace(':free', '')
  );
  if (found) return found.name;

  // Formatting cleanup fallback
  return modelId
    .replace('opencode/', '')
    .replace('openrouter/', '')
    .replace(':free', '')
    .replace('meta-llama/', '')
    .replace('deepseek/', '')
    .replace('qwen/', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
