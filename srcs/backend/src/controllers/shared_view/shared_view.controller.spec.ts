import { Test, TestingModule } from '@nestjs/testing';
import { SharedViewController } from './shared_view.controller';

describe('SharedViewController', () => {
  let controller: SharedViewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharedViewController],
    }).compile();

    controller = module.get<SharedViewController>(SharedViewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
