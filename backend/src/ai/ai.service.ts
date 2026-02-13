import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface NemotronApiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable()
export class AiService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private readonly httpService: HttpService) {
    const apiUrl = process.env.NEMOTRON_API_URL;
    const apiKey = process.env.NEMOTRON_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new InternalServerErrorException(
        'NEMOTRON_API_URL and NEMOTRON_API_KEY environment variables are required',
      );
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.model = process.env.NEMOTRON_MODEL || 'nemotron-3-nano-30b-a3b';
  }

  /**
   * Calls Nemotron API with a prompt and returns the response text
   */
  async callNemotron(prompt: string): Promise<string> {
    try {
      const requestBody = {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      };

      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      };

      const response: AxiosResponse<NemotronApiResponse> = await firstValueFrom(
        this.httpService.post<NemotronApiResponse>(this.apiUrl, requestBody, { headers }),
      );

      const content = response.data?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new InternalServerErrorException(
          'Invalid response format from Nemotron API',
        );
      }

      return content;
    } catch (error: any) {
      if (error.response) {
        throw new BadRequestException(
          `Nemotron API error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`,
        );
      }
      
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to call Nemotron API: ${error.message}`,
      );
    }
  }

  /**
   * Safely parses JSON text, returns null if parsing fails
   */
  safeJsonParse(text: string): any {
    try {
      return JSON.parse(text.trim());
    } catch (error) {
      return null;
    }
  }

  /**
   * Calls Nemotron API and attempts to parse the response as JSON
   * Retries once with a JSON fix prompt if initial parsing fails
   */
  async callNemotronAndParseJson(prompt: string): Promise<any> {
    // First attempt
    const firstResponse = await this.callNemotron(prompt);
    const firstParsed = this.safeJsonParse(firstResponse);

    if (firstParsed !== null) {
      return firstParsed;
    }

    // Retry with JSON fix prompt
    const fixPrompt = `Fix JSON and return only valid JSON: ${firstResponse}`;
    const secondResponse = await this.callNemotron(fixPrompt);
    const secondParsed = this.safeJsonParse(secondResponse);

    if (secondParsed !== null) {
      return secondParsed;
    }

    // Both attempts failed
    throw new BadRequestException(
      'Failed to parse valid JSON from Nemotron API response after retry',
    );
  }
}