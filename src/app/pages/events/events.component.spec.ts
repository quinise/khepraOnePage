import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { EventsComponent } from './events.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
