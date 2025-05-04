import { TestBed } from '@angular/core/testing';

import { EventFilterService } from './event-filter.service';

describe('EventFilterService', () => {
  let service: EventFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
