import { Test, TestingModule } from '@nestjs/testing';
import { PdfMakerService } from './pdf-maker.service';

describe('PdfMakerService', () => {
  let service: PdfMakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfMakerService],
    }).compile();

    service = module.get<PdfMakerService>(PdfMakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
