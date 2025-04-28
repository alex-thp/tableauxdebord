import { Test, TestingModule } from '@nestjs/testing';
import { UpdateBaseService } from './update-base.service';

describe('UpdateBaseService', () => {
  let service: UpdateBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateBaseService],
    }).compile();

    service = module.get<UpdateBaseService>(UpdateBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
