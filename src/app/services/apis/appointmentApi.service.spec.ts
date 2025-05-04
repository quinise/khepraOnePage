import { TestBed } from '@angular/core/testing';

import { AppointmentApiService } from './appointmentApi.service';

describe('ApiService', () => {
  let service: AppointmentApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
