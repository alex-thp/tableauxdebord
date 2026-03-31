import { Test, TestingModule } from '@nestjs/testing';
import { StatsBenevoleController } from './stats_benevole.controller';

describe('StatsBenevoleController', () => {
  let controller: StatsBenevoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsBenevoleController],
    }).compile();

    controller = module.get<StatsBenevoleController>(StatsBenevoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
