import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { AuthService } from 'src/app/services/authentication/auth.service';
class MockAuthService {
  user$ = null;
}

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [AppComponent],
    providers: [
      provideRouter(routes),
      { provide: AuthService, useClass: MockAuthService },
    ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
