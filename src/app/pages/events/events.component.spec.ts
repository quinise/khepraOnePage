import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { EventsComponent } from './events.component';
import { GET_AUTH_TOKEN } from 'src/app/services/authentication/auth-wrapper.service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  template: '<div>Mock Calendar</div>',
})
class MockCalendarViewComponent {}

class MockAuthService {
  user$ = of({ role: 'admin' });
}

describe('EventsComponent', () => {
  let component: EventsComponent;
  let fixture: ComponentFixture<EventsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        EventsComponent,
        MockCalendarViewComponent,
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting,
        { provide: AuthService, useClass: MockAuthService },
        { provide: GET_AUTH_TOKEN, useValue: () => Promise.resolve('fake-token') }, // ✅ Add this
      ]
    });

    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
