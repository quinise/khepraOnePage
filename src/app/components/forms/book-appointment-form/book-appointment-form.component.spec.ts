import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { ConflictCheckService } from 'src/app/services/conflict-check.service';
import { createMockAppointment } from 'src/app/testing/mocks';
import { AppointmentFormComponent } from './book-appointment-form.component';

const authServiceSpy = jasmine.createSpyObj('AuthService', ['checkEmailExists'], {
  user$: of({
    uid: 'user1',
    role: 'user',
    displayName: 'Test User',
    email: 'test@example.com'
  })
});

describe('AppointmentFormComponent', () => {

  describe('Basic Creation', () => {
    let component: AppointmentFormComponent;
    let fixture: ComponentFixture<AppointmentFormComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AppointmentFormComponent, MatDialogModule],
        providers: [
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting,
          { provide: AppointmentApiService, useValue: jasmine.createSpyObj('AppointmentApiService', ['getAllAppointments', 'createAppointment', 'updateAppointment']) },
          { provide: AuthService, useValue: authServiceSpy },
          { provide: ConflictCheckService, useValue: jasmine.createSpyObj('ConflictCheckService', ['checkForConflicts']) },
          { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
          { provide: MAT_DIALOG_DATA, useValue: { serviceType: 'READING' } }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(AppointmentFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Appointment Creation', () => {
    let component: AppointmentFormComponent;
    let fixture: ComponentFixture<AppointmentFormComponent>;
    let appointmentApiSpy: jasmine.SpyObj<AppointmentApiService>;

    beforeEach(async () => {
      appointmentApiSpy = jasmine.createSpyObj('AppointmentApiService', ['getAllAppointments', 'createAppointment', 'updateAppointment']);
      appointmentApiSpy.getAllAppointments.and.returnValue(of([]));
      
      authServiceSpy.checkEmailExists.and.returnValue(of(true));
      
      await TestBed.configureTestingModule({
        imports: [AppointmentFormComponent, MatDialogModule],
        providers: [
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting,
          { provide: AppointmentApiService, useValue: appointmentApiSpy },
          { provide: AuthService, useValue: authServiceSpy },
          { provide: ConflictCheckService, useValue: jasmine.createSpyObj('ConflictCheckService', ['checkForConflicts']) },
          { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
          { provide: MAT_DIALOG_DATA, useValue: { serviceType: 'READING' } }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(AppointmentFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should emit appointmentSaved and reset form on successful creation', async () => {
      const mock = createMockAppointment();
      
      component['isAdmin'] = true;

      component.form.patchValue({
        name: mock.name,
        email: mock.email,
        phoneNumber: mock.phoneNumber,
        streetAddress: mock.streetAddress,
        city: mock.city,
        state: mock.state,
        zipCode: mock.zipCode,
        date: new Date(mock.date),
        time: new Date(mock.startTime),
        isVirtual: mock.isVirtual,
        type: mock.type
      });

      spyOn(component.appointmentSaved, 'emit');
      appointmentApiSpy.createAppointment.and.returnValue(of(mock));

      await component.onSubmit();
      const dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<AppointmentFormComponent>>;
      expect(dialogRefSpy.close).toHaveBeenCalledWith(mock);
      expect(appointmentApiSpy.createAppointment).toHaveBeenCalled();
      expect(component.appointmentSaved.emit).toHaveBeenCalledWith(mock);
    });
  });

  describe('Editing Mode', () => {
    let component: AppointmentFormComponent;
    let fixture: ComponentFixture<AppointmentFormComponent>;
    const mock = createMockAppointment();

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AppointmentFormComponent, MatDialogModule],
        providers: [
          provideHttpClient(withInterceptorsFromDi()),
          provideHttpClientTesting,
          { provide: AppointmentApiService, useValue: jasmine.createSpyObj('AppointmentApiService', ['getAllAppointments', 'createAppointment', 'updateAppointment']) },
          { provide: AuthService, useValue: authServiceSpy },
          { provide: ConflictCheckService, useValue: jasmine.createSpyObj('ConflictCheckService', ['checkForConflicts']) },
          { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
          { provide: MAT_DIALOG_DATA, useValue: { serviceType: 'INITIATION', appointmentToEdit: mock } }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(AppointmentFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should patch form values when editing an appointment', () => {
      const patched = component.form.value;
      expect(patched.name).toBe(mock.name);
      expect(patched.email).toBe(mock.email);
      expect(patched.type).toBe(mock.type);
    });
  });
});
