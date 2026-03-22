import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';

import { StrategiesService } from './strategies.service';
import { Strategy, MainObjective, Tone } from './schemas/strategy.schema';
import { User } from '../users/entities/user.entity';
import { AiService } from '../ai/ai.service';
import { AiMonitoringService } from '../ai-monitoring/ai-monitoring.service';

describe('StrategiesService', () => {
  let service: StrategiesService;
  let aiService: jest.Mocked<AiService>;
  let aiMonitoringService: jest.Mocked<AiMonitoringService>;

  const mockUserId = new Types.ObjectId().toString();
  const mockStrategyId = new Types.ObjectId().toString();

  const mockStrategy = {
    _id: mockStrategyId,
    userId: mockUserId,
    businessInfo: { 
      businessName: 'Test Biz',
      industry: 'Tech',
      mainObjective: MainObjective.LEADS,
      tone: Tone.PROFESSIONAL
    },
    generatedStrategy: { 
      avant: { marcheCible: {}, messageMarketing: {}, canauxCommunication: {} },
      pendant: { captureProspects: {}, nurturing: {}, conversion: {} },
      apres: { experienceClient: {}, augmentationValeurClient: {}, recommandation: {} }
    },
    save: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
    toObject: jest.fn().mockReturnThis(),
  };

  class MockQuery {
    private result: any;
    constructor(result: any = null) { this.result = result; }
    select = jest.fn().mockReturnThis();
    populate = jest.fn().mockReturnThis();
    sort = jest.fn().mockReturnThis();
    skip = jest.fn().mockReturnThis();
    limit = jest.fn().mockReturnThis();
    exec = jest.fn().mockImplementation(() => Promise.resolve(this.result));
    then = jest.fn().mockImplementation((resolve, reject) => Promise.resolve(this.result).then(resolve, reject));
  }

  class MockModel {
    constructor(public data: any) { Object.assign(this, data); }
    save() { return Promise.resolve(this); }
    static find = jest.fn().mockReturnValue(new MockQuery());
    static findOne = jest.fn().mockReturnValue(new MockQuery());
    static findById = jest.fn().mockReturnValue(new MockQuery());
    static countDocuments = jest.fn().mockReturnValue(new MockQuery(0));
    static deleteOne = jest.fn().mockReturnValue(new MockQuery({ deletedCount: 1 }));
    static findOneAndUpdate = jest.fn().mockReturnValue(new MockQuery());
  }

  beforeEach(async () => {
    const mockAiService = {
      callNemotronAndParseJson: jest.fn(),
      getModelName: jest.fn().mockReturnValue('test-model'),
    };
    const mockAiMonitoringService = {
      createLog: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrategiesService,
        {
          provide: getModelToken(Strategy.name),
          useValue: MockModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: MockModel,
        },
        { provide: AiService, useValue: mockAiService },
        { provide: AiMonitoringService, useValue: mockAiMonitoringService },
      ],
    }).compile();

    service = module.get<StrategiesService>(StrategiesService);
    aiService = module.get(AiService);
    aiMonitoringService = module.get(AiMonitoringService);
  });

  describe('generateFullStrategy', () => {
    it('should successfully generate a strategy', async () => {
      const dto = {
        businessName: 'Test Biz',
        industry: 'Tech',
        productOrService: 'SaaS',
        targetAudience: 'Devs',
        location: 'Global',
        mainObjective: MainObjective.LEADS,
        tone: Tone.PROFESSIONAL,
      };

      const aiResponse = {
        avant: { marcheCible: { persona: 'Dev', besoins: [], problemes: [], comportementDigital: [] }, messageMarketing: { propositionValeur: 'V', messagePrincipal: 'M', tonCommunication: 'T' }, canauxCommunication: { plateformes: [], typesContenu: {} } },
        pendant: { captureProspects: { landingPage: 'L', formulaire: 'F', offreIncitative: [] }, nurturing: { sequenceEmails: [], contenusEducatifs: [], relances: [] }, conversion: { cta: [], offres: [], argumentaireVente: [] } },
        apres: { experienceClient: { recommendations: [] }, augmentationValeurClient: { upsell: [], crossSell: [], fidelite: [] }, recommandation: { parrainage: [], avisClients: [], recompenses: [] } }
      };

      (MockModel.countDocuments as jest.Mock).mockReturnValue(new MockQuery(0)); // checkFreePlanLimit
      aiService.callNemotronAndParseJson.mockResolvedValue(aiResponse);
      jest.spyOn(MockModel.prototype, 'save').mockResolvedValue(mockStrategy);

      const result = await service.generateFullStrategy(mockUserId, dto);
      expect(result).toBeDefined();
      expect(aiService.callNemotronAndParseJson).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if free plan limit reached', async () => {
      (MockModel.countDocuments as jest.Mock).mockReturnValue(new MockQuery(3));
      await expect(service.generateFullStrategy(mockUserId, {} as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return strategies and total', async () => {
       (MockModel.find as jest.Mock).mockReturnValue(new MockQuery([]));
       (MockModel.countDocuments as jest.Mock).mockReturnValue(new MockQuery(0));
       const result = await service.findAll(mockUserId);
       expect(result.strategies).toEqual([]);
       expect(result.total).toBe(0);
    });
  });

  describe('deleteOne', () => {
    it('should successfully delete strategy', async () => {
      (MockModel.deleteOne as jest.Mock).mockReturnValue(new MockQuery({ deletedCount: 1 }));
      await service.deleteOne(mockUserId, mockStrategyId);
      expect(MockModel.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if nothing deleted', async () => {
      (MockModel.deleteOne as jest.Mock).mockReturnValue(new MockQuery({ deletedCount: 0 }));
      await expect(service.deleteOne(mockUserId, mockStrategyId)).rejects.toThrow(NotFoundException);
    });
  });
});
