import { TestBed } from '@angular/core/testing';

import { DevGatewayService } from './dev-gateway.service';

describe('DevGatewayService', () => {
  let service: DevGatewayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevGatewayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
