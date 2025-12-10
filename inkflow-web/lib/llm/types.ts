// LLM Provider Types

export type LLMProvider = 'openai' | 'anthropic' | 'deepseek' | 'custom'

export type LLMFunction = 'generate' | 'plan' | 'outline' | 'extract'

export interface ProviderConfig {
  apiKey: string
  baseURL?: string
  model: string
}

export interface LLMConfig {
  defaultProvider: LLMProvider
  generateProvider?: LLMProvider
  planProvider?: LLMProvider
  providers: Record<LLMProvider, ProviderConfig | null>
}

export interface GenerateOptions {
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  topP?: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}
