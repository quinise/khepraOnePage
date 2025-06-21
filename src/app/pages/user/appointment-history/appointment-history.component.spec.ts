import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { DeleteEventService } from 'src/app/services/delete-event.service';
import { AppointmentHistoryComponent } from './appointment-history.component';

describe('AppointmentHistoryComponent', () => {
  let component: AppointmentHistoryComponent;
  let fixture: ComponentFixture<AppointmentHistoryComponent>;

  const mockAppointments: Appointment[] = [
    { id: 1, userId: '123', type: 'READING', date: new Date(), startTime: new Date(), endTime: new Date() } as Appointment
  ];

  const authServiceStub = {
    user$: of({ uid: '123' })
  };

  const appointmentApiServiceStub = {
    getAppointmentsByUserId: jasmine.createSpy().and.callFake((uid: string, type: string) => {
      return of(mockAppointments);
    })
  };

  const deleteEventServiceStub = {
    deleteAppointment: jasmine.createSpy()
  };

  const matDialogStub = {
    open: jasmine.createSpy().and.returnValue({
      componentInstance: {
        appointmentSaved: new BehaviorSubject(mockAppointments[0])
      }
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentHistoryComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: AppointmentApiService, useValue: appointmentApiServiceStub },
        { provide: DeleteEventService, useValue: deleteEventServiceStub },
        { provide: MatDialog, useValue: matDialogStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch upcoming and past appointments on init', () => {
    expect(appointmentApiServiceStub.getAppointmentsByUserId).toHaveBeenCalledWith('123', 'upcoming');
    expect(appointmentApiServiceStub.getAppointmentsByUserId).toHaveBeenCalledWith('123', 'past');
    expect(component.upcomingAppointments.length).toBe(1);
  });

  it('should open the edit dialog with appointment data', () => {
    component.editAppointment(mockAppointments[0]);
    expect(matDialogStub.open).toHaveBeenCalled();
  });

  it('should call deleteAppointment from deleteService', () => {
    component.upcomingAppointments = [...mockAppointments];
    component.deleteAppointment(mockAppointments[0].id!);
    expect(deleteEventServiceStub.deleteAppointment).toHaveBeenCalled();
  });
});
