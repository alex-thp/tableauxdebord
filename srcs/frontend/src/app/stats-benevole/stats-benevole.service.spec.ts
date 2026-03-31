import { TestBed } from '@angular/core/testing';

import { StatsBenevoleService } from './stats-benevole.service';

describe('StatsBenevoleService', () => {
  let service: StatsBenevoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsBenevoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
