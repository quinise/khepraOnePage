import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ServicesComponent } from './services.component';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  template: ''
})
class DummyAppointmentFormComponent {}

describe('ServicesComponent', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;

  const mockMatDialog = {
    open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) })
  };

  const mockAuthService = {
    user$: of({ role: 'user' })
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ServicesComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting,
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: AuthService, useValue: mockAuthService },
      ]
    });

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;

    (component as any).dialog = mockMatDialog;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isUser to true if user role is "user"', () => {
    expect(component.isUser).toBeTrue();
  });

  it('should open dialog with correct service type', () => {
    component.openServiceForm('readingButton');

    expect(component.selectedServiceType).toBe('Reading');
    expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      minWidth: '500px',
      data: { serviceType: 'Reading' }
    });
  });
});
