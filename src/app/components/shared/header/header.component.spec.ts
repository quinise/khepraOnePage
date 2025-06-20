import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { HeaderComponent } from './header.component';

class MockAuthService {
  user$ = of(null);
  logout = jasmine.createSpy('logout');
}

class MockMatDialog {
  open() {
    return {
      afterClosed: () => of(true)
    };
  }
}

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (key: string) => 'mockValue'
    }
  },
  params: of({}),
  queryParams: of({}),
  data: of({})
};

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});