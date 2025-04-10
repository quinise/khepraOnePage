import { TestBed } from '@angular/core/testing';

import { BookAppointment } from './bookAppointment.service';

describe('BookService', () => {
  let service: BookAppointment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookAppointment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
