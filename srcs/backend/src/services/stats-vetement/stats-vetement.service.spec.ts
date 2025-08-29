import { Test, TestingModule } from '@nestjs/testing';
import { StatsVetementService } from './stats-vetement.service';

describe('StatsVetementService', () => {
  let service: StatsVetementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsVetementService],
    }).compile();

    service = module.get<StatsVetementService>(StatsVetementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
