import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'OPENROUTER_API_URL') return 'https://api.example.com';
        if (key === 'OPENROUTER_API_KEY') return 'sk-test-key';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    configService = module.get(ConfigService);
    
    // Mock global fetch
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('configuration', () => {
    it('should throw if API key is missing', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'OPENROUTER_API_URL') return 'test';
        return null;
      });
      expect(() => new AiService(configService)).toThrow(InternalServerErrorException);
    });
  });

  describe('callNemotron', () => {
    it('should return content on success', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'AI Response' } }]
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.callNemotron('Hello');
      expect(result).toBe('AI Response');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on 401', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue(JSON.stringify({ error: { message: 'Invalid key' } })),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.callNemotron('Hello')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = service.safeJsonParse('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should parse JSON inside markdown blocks', () => {
      const result = service.safeJsonParse('Sure, here is your json: ```json\n{"key": "value"}\n``` and more text.');
      expect(result).toEqual({ key: 'value' });
    });

    it('should return null for invalid JSON', () => {
      const result = service.safeJsonParse('not json');
      expect(result).toBeNull();
    });
  });

  describe('callNemotronAndParseJson', () => {
    it('should parse JSON from first response if valid', async () => {
      jest.spyOn(service, 'callNemotron').mockResolvedValue('{"success": true}');
      const result = await service.callNemotronAndParseJson('prompt');
      expect(result).toEqual({ success: true });
      expect(service.callNemotron).toHaveBeenCalledTimes(1);
    });

    it('should retry with fix prompt if first response is invalid', async () => {
      jest.spyOn(service, 'callNemotron')
        .mockResolvedValueOnce('Invalid JSON')
        .mockResolvedValueOnce('{"fixed": true}');
      
      const result = await service.callNemotronAndParseJson('prompt');
      expect(result).toEqual({ fixed: true });
      expect(service.callNemotron).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if retry also fails', async () => {
      jest.spyOn(service, 'callNemotron').mockResolvedValue('Invalid JSON');
      await expect(service.callNemotronAndParseJson('prompt')).rejects.toThrow(BadRequestException);
    });
  });
});
