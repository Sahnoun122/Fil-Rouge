import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  private readonly appUrl: string;
  private readonly appTitle: string;

  constructor(private readonly configService: ConfigService) {
    const apiUrl = this.sanitizeEnvValue(
      this.configService.get<string>('OPENROUTER_API_URL'),
    );
    const apiKey = this.sanitizeEnvValue(
      this.configService.get<string>('OPENROUTER_API_KEY'),
    );

    if (!apiUrl || !apiKey) {
      throw new InternalServerErrorException(
        'OPENROUTER_API_URL and OPENROUTER_API_KEY environment variables are required',
      );
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.model =
      this.sanitizeEnvValue(this.configService.get<string>('OPENROUTER_MODEL')) ||
      'nvidia/nemotron-3-nano-30b-a3b:free';
    this.appUrl =
      this.sanitizeEnvValue(this.configService.get<string>('FRONTEND_URL')) ||
      'http://localhost:3001';
    this.appTitle = 'MarketPlan IA';

    if (process.env.NODE_ENV === 'development') {
      console.log('AI Service configured:', {
        url: this.apiUrl,
        model: this.model,
        hasApiKey: Boolean(this.apiKey),
        keyPrefix: this.apiKey.slice(0, 8),
      });
    }
  }

  getModelName(): string {
    return this.model;
  }

  getConfigurationSummary() {
    return {
      apiUrl: this.apiUrl,
      model: this.model,
      hasApiKey: Boolean(this.apiKey),
      keyPrefix: this.apiKey.slice(0, 8),
    };
  }

  async callNemotron(prompt: string): Promise<string> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Calling OpenRouter API:', {
          url: this.apiUrl,
          model: this.model,
          promptLength: prompt.length,
        });
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.appUrl,
          'X-Title': this.appTitle,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        const parsedMessage = this.extractOpenRouterErrorMessage(errorData);

        console.error('OpenRouter API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });

        if (response.status === 401) {
          const normalizedUnauthorizedMessage =
            this.normalizeUnauthorizedMessage(parsedMessage);

          throw new UnauthorizedException(
            normalizedUnauthorizedMessage ||
              "Cle OpenRouter invalide ou revoquee. Verifiez OPENROUTER_API_KEY dans backend/.env et regenerez-la depuis OpenRouter si besoin.",
          );
        }

        throw new BadRequestException(
          parsedMessage ||
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
        console.log('OpenRouter API response received, length:', content.length);
      }

      return content;
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to call OpenRouter API: ${error.message}`,
      );
    }
  }

  safeJsonParse(text: string): any {
    try {
      return JSON.parse(text.trim());
    } catch {
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

  async callNemotronAndParseJson(prompt: string): Promise<any> {
    const firstResponse = await this.callNemotron(prompt);
    const firstParsed = this.safeJsonParse(firstResponse);

    if (firstParsed !== null) {
      return firstParsed;
    }

    console.warn(
      'First response was not valid JSON, retrying with fix prompt...',
    );

    const fixPrompt = `The following text should be valid JSON but it is not. Fix it and return ONLY the valid JSON object, no explanation, no markdown:\n\n${firstResponse}`;
    const secondResponse = await this.callNemotron(fixPrompt);
    const secondParsed = this.safeJsonParse(secondResponse);

    if (secondParsed !== null) {
      return secondParsed;
    }

    throw new BadRequestException(
      'Failed to parse valid JSON from OpenRouter API response after retry',
    );
  }

  private sanitizeEnvValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    return value.trim().replace(/^['"]|['"]$/g, '');
  }

  private extractOpenRouterErrorMessage(rawBody: string): string | null {
    const trimmed = rawBody.trim();
    if (!trimmed) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed) as {
        error?: { message?: string };
        message?: string;
      };

      return parsed.error?.message || parsed.message || trimmed;
    } catch {
      return trimmed;
    }
  }

  private normalizeUnauthorizedMessage(message: string | null): string | null {
    if (!message) {
      return null;
    }

    const normalized = message.trim().toLowerCase();
    if (normalized === 'user not found.') {
      return (
        "Cle OpenRouter invalide ou rattachee a un compte inexistant. " +
        'Regenerer OPENROUTER_API_KEY depuis OpenRouter puis redemarrer le backend.'
      );
    }

    return message;
  }
}
