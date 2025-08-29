import { Test, TestingModule } from '@nestjs/testing';
import { PdfMakerController } from './pdf-maker.controller';

describe('PdfMakerController', () => {
  let controller: PdfMakerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfMakerController],
    }).compile();

    controller = module.get<PdfMakerController>(PdfMakerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
