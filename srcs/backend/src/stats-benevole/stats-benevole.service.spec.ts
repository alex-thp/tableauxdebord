import { Test, TestingModule } from '@nestjs/testing';
import { StatsBenevoleService } from './stats-benevole.service';

describe('StatsBenevoleService', () => {
  let service: StatsBenevoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsBenevoleService],
    }).compile();

    service = module.get<StatsBenevoleService>(StatsBenevoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
