// LLM Configuration Loader

import type { LLMConfig, LLMProvider, LLMFunction, ProviderConfig } from './types'

/**
 * Load LLM configuration from environment variables
 */
export function loadLLMConfig(): LLMConfig {
  const defaultProvider = (process.env.LLM_DEFAULT_PROVIDER as LLMProvider) || 'openai'
  const generateProvider = process.env.LLM_GENERATE_PROVIDER as LLMProvider | undefined
  const planProvider = process.env.LLM_PLAN_PROVIDER as LLMProvider | undefined

  return {
    defaultProvider,
    generateProvider: generateProvider || undefined,
    planProvider: planProvider || undefined,
    providers: {
      openai: loadOpenAIConfig(),
      anthropic: loadAnthropicConfig(),
      deepseek: loadDeepSeekConfig(),
      custom: loadCustomConfig(),
    },
  }
}

function loadOpenAIConfig(): ProviderConfig | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  return {
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  }
}

function loadAnthropicConfig(): ProviderConfig | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  // Anthropic uses OpenAI-compatible API via their proxy or third-party services
  return {
    apiKey,
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  }
}

function loadDeepSeekConfig(): ProviderConfig | null {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return null

  return {
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  }
}

function loadCustomConfig(): ProviderConfig | null {
  const apiKey = process.env.CUSTOM_LLM_API_KEY
  const baseURL = process.env.CUSTOM_LLM_BASE_URL
  const model = process.env.CUSTOM_LLM_MODEL

  if (!baseURL || !model) return null

  return {
    apiKey: apiKey || 'not-needed', // Some local models don't need API key
    baseURL,
    model,
  }
}

/**
 * Get provider config for a specific function
 */
export function getProviderForFunction(
  config: LLMConfig,
  fn: LLMFunction
): { provider: LLMProvider; config: ProviderConfig } {
  let provider: LLMProvider

  // Determine which provider to use based on function
  if (fn === 'generate' && config.generateProvider) {
    provider = config.generateProvider
  } else if (fn === 'plan' && config.planProvider) {
    provider = config.planProvider
  } else {
    provider = config.defaultProvider
  }

  const providerConfig = config.providers[provider]
  if (!providerConfig) {
    // Fallback to default provider if specified one is not configured
    const fallbackConfig = config.providers[config.defaultProvider]
    if (!fallbackConfig) {
      throw new Error(
        `LLM provider "${provider}" is not configured. Please set the required environment variables.`
      )
    }
    return { provider: config.defaultProvider, config: fallbackConfig }
  }

  return { provider, config: providerConfig }
}

/**
 * Validate LLM configuration
 */
export function validateConfig(config: LLMConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check if at least one provider is configured
  const hasAnyProvider = Object.values(config.providers).some((p) => p !== null)
  if (!hasAnyProvider) {
    errors.push('No LLM provider configured. Please set at least one provider API key.')
  }

  // Check if default provider is configured
  if (!config.providers[config.defaultProvider]) {
    errors.push(
      `Default provider "${config.defaultProvider}" is not configured. Please set the required environment variables.`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
