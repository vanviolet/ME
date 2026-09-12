export interface AiModelConfig {
  id: string;
  name: string;
  badge?: string;
  category: 'ultra' | 'reasoning' | 'fast' | 'code';
}

export const AI_MODELS_LIST: AiModelConfig[] = [
  { id: 'nemotron-3-ultra', name: 'Nemotron 3 Ultra', badge: 'Ultra Reasoning', category: 'ultra' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', badge: 'Deep Reasoning', category: 'reasoning' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', badge: 'Next-Gen', category: 'fast' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', badge: 'Fast & Smart', category: 'fast' },
  { id: 'mimo-v2-pro', name: 'MiMo V2 Pro', badge: 'Balanced Pro', category: 'ultra' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', badge: 'Open Flagship', category: 'reasoning' },
  { id: 'qwen-2.5-coder', name: 'Qwen 2.5 Coder', badge: 'Code & Math', category: 'code' },
  { id: 'minimax-m2.5', name: 'MiniMax M2.5', badge: 'Creative', category: 'ultra' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', badge: 'Ultra Fast', category: 'fast' },
];

export function getCleanModelName(modelId: string): string {
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
