import { Test, TestingModule } from '@nestjs/testing';
import { BoussoleController } from './boussole.controller';

describe('BoussoleController', () => {
  let controller: BoussoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoussoleController],
    }).compile();

    controller = module.get<BoussoleController>(BoussoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
