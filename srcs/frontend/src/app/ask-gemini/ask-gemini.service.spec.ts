import { TestBed } from '@angular/core/testing';

import { AskGeminiService } from './ask-gemini.service';

describe('AskGeminiService', () => {
  let service: AskGeminiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AskGeminiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
