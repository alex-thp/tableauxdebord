import { Test, TestingModule } from '@nestjs/testing';
import { BoussoleService } from './boussole.service';

describe('BoussoleService', () => {
  let service: BoussoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoussoleService],
    }).compile();

    service = module.get<BoussoleService>(BoussoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
