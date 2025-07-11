import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { AccountSettingsComponent } from './account-settings.component';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';
import { GET_AUTH_TOKEN } from 'src/app/services/authentication/auth-wrapper.service';
@Component({ selector: 'app-change-password', standalone: true, template: '' })
class MockChangePasswordComponent {}

@Component({ selector: 'app-delete-account', standalone: true, template: '' })
class MockDeleteAccountComponent {}

const mockAuthWrapperService = {
  user$: of({ role: 'user' }),
  getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(Promise.resolve({ uid: 'test-user' }))
};

describe('AccountSettingsComponent', () => {
  let component: AccountSettingsComponent;
  let fixture: ComponentFixture<AccountSettingsComponent>;

  function createTestBedWithUser(user: any) {
    return TestBed.configureTestingModule({
      imports: [
        AccountSettingsComponent,
        MockChangePasswordComponent,
        MockDeleteAccountComponent,
      ],
      providers: [
        { provide: GET_AUTH_TOKEN, useValue: of('mock-token') },
        {
          provide: AuthWrapperService,
          useValue: mockAuthWrapperService,
        },
        {
          provide: AuthService,
          useValue: {
            user$: of(user),
          },
        },
      ],
    }).compileComponents();
  }

  it('should create the component', async () => {
    await createTestBedWithUser({ role: 'user' });
    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set isUser to true if role is user', async () => {
    await createTestBedWithUser({ role: 'user' });
    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isUser).toBeTrue();
  });

  it('should set isUser to false if role is admin', async () => {
    await createTestBedWithUser({ role: 'admin' });
    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isUser).toBeFalse();
  });

  it('should set isUser to false if no user is emitted', async () => {
    await createTestBedWithUser(null);
    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isUser).toBeFalse();
  });
});