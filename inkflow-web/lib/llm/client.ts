// LLM Client - OpenAI-compatible API wrapper

import OpenAI from 'openai'
import type { ProviderConfig, ChatMessage, GenerateOptions, LLMFunction } from './types'
import { loadLLMConfig, getProviderForFunction } from './config'

/**
 * Create an OpenAI client for the specified provider
 */
export function createClient(config: ProviderConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  })
}

/**
 * Get a configured client for a specific function
 */
export function getClientForFunction(fn: LLMFunction): { client: OpenAI; model: string } {
  const llmConfig = loadLLMConfig()
  const { config } = getProviderForFunction(llmConfig, fn)

  return {
    client: createClient(config),
    model: config.model,
  }
}

/**
 * Generate text with streaming support
 */
export async function* streamGenerate(
  messages: ChatMessage[],
  options: GenerateOptions = {},
  fn: LLMFunction = 'generate'
): AsyncGenerator<string, void, unknown> {
  const { client, model } = getClientForFunction(fn)

  const stream = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature ?? 0.8,
    max_tokens: options.maxTokens ?? 2000,
    top_p: options.topP ?? 0.95,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}

/**
 * Generate text without streaming
 */
export async function generate(
  messages: ChatMessage[],
  options: GenerateOptions = {},
  fn: LLMFunction = 'generate'
): Promise<string> {
  const { client, model } = getClientForFunction(fn)

  const response = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature ?? 0.8,
    max_tokens: options.maxTokens ?? 2000,
    top_p: options.topP ?? 0.95,
    stream: false,
  })

  return response.choices[0]?.message?.content || ''
}

/**
 * Generate structured JSON output
 */
export async function generateJSON<T>(
  messages: ChatMessage[],
  options: GenerateOptions = {},
  fn: LLMFunction = 'plan'
): Promise<T> {
  const { client, model } = getClientForFunction(fn)

  const response = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2000,
    response_format: { type: 'json_object' },
    stream: false,
  })

  const content = response.choices[0]?.message?.content || '{}'

  try {
    return JSON.parse(content) as T
  } catch {
    throw new Error(`Failed to parse LLM response as JSON: ${content}`)
  }
}
