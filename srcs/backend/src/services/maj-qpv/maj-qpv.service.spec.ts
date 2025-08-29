import { Test, TestingModule } from '@nestjs/testing';
import { MajQpvService } from './maj-qpv.service';

describe('MajQpvService', () => {
  let service: MajQpvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MajQpvService],
    }).compile();

    service = module.get<MajQpvService>(MajQpvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
