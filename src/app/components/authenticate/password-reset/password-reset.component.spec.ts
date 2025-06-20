import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordResetComponent } from './password-reset.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<PasswordResetComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [PasswordResetComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit when email is empty', () => {
    component.emailControl.setValue('');
    component.onSubmit();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should not submit with invalid email', () => {
    component.emailControl.setValue('invalid-email');
    component.onSubmit();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close the dialog and pass email when form is valid', () => {
    const validEmail = 'user@example.com';
    component.emailControl.setValue(validEmail);
    component.onSubmit();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(validEmail);
  });

  it('should close the dialog without data on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });
});