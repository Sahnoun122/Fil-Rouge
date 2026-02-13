import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      reasoning_details?: any;
    };
  }>;
}

@Injectable()
export class AiService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor() {
    const apiUrl = process.env.OPENROUTER_API_URL;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new InternalServerErrorException(
        'OPENROUTER_API_URL and OPENROUTER_API_KEY environment variables are required',
      );
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-nano-30b-a3b:free';

    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 AI Service configured:', {
        url: this.apiUrl,
        model: this.model,
      });
    }
  }

  /**
   * Calls OpenRouter API (nvidia/nemotron-3-nano-30b-a3b:free) and returns the response text
   */
  async callNemotron(prompt: string): Promise<string> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🤖 Calling OpenRouter API:', {
          url: this.apiUrl,
          model: this.model,
          promptLength: prompt.length,
        });
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('🔥 OpenRouter API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });
        throw new BadRequestException(
          `OpenRouter API error: ${response.status} - ${response.statusText}`,
        );
      }

      const result: OpenRouterResponse = await response.json();
      const content = result?.choices?.[0]?.message?.content;

      if (!content) {
        throw new InternalServerErrorException(
          'Invalid response format from OpenRouter API',
        );
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ OpenRouter API response received, length:', content.length);
      }

      return content;
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to call OpenRouter API: ${error.message}`,
      );
    }
  }

  /**
   * Safely parses JSON text, returns null if parsing fails.
   * Handles markdown-wrapped JSON (```json ... ```)
   */
  safeJsonParse(text: string): any {
    try {
      // Try direct parse first
      return JSON.parse(text.trim());
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Calls OpenRouter API and attempts to parse the response as JSON.
   * Retries once with a JSON fix prompt if initial parsing fails.
   */
  async callNemotronAndParseJson(prompt: string): Promise<any> {
    // First attempt
    const firstResponse = await this.callNemotron(prompt);
    const firstParsed = this.safeJsonParse(firstResponse);

    if (firstParsed !== null) {
      return firstParsed;
    }

    console.warn('⚠️ First response was not valid JSON, retrying with fix prompt...');

    // Retry with JSON fix prompt
    const fixPrompt = `The following text should be valid JSON but it is not. Fix it and return ONLY the valid JSON object, no explanation, no markdown:\n\n${firstResponse}`;
    const secondResponse = await this.callNemotron(fixPrompt);
    const secondParsed = this.safeJsonParse(secondResponse);

    if (secondParsed !== null) {
      return secondParsed;
    }

    // Both attempts failed
    throw new BadRequestException(
      'Failed to parse valid JSON from OpenRouter API response after retry',
    );
  }
}
