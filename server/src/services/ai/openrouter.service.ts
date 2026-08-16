import { config } from '../../config/constants';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.openrouter.apiKey;
    this.model = config.openrouter.model;
    this.baseUrl = config.openrouter.baseUrl;
  }

  async complete(
    messages: OpenRouterMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      responseFormat?: 'json' | 'text';
    }
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your .env file.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.ai.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': config.clientUrl,
          'X-Title': 'EduPortal Academic Intelligence',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: options?.maxTokens || 2000,
          temperature: options?.temperature ?? 0.7,
          ...(options?.responseFormat === 'json' && {
            response_format: { type: 'json_object' },
          }),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as OpenRouterResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI model');
      }

      return data.choices[0].message.content;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('AI request timed out. Please try again.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const openRouterService = new OpenRouterService();
