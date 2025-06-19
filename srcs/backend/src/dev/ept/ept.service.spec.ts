import { Test, TestingModule } from '@nestjs/testing';
import { EptService } from './ept.service';

describe('EptService', () => {
  let service: EptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EptService],
    }).compile();

    service = module.get<EptService>(EptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
