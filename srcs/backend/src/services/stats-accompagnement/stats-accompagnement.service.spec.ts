import { Test, TestingModule } from '@nestjs/testing';
import { StatsAccompagnementService } from './stats-accompagnement.service';

describe('StatsAccompagnementService', () => {
  let service: StatsAccompagnementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsAccompagnementService],
    }).compile();

    service = module.get<StatsAccompagnementService>(StatsAccompagnementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
