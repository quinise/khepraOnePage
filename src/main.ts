import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { firebaseConfig } from '../src/firebase-config';
import { routes } from './app/app.routes';
import { GET_AUTH_TOKEN } from './app/services/authentication/auth-wrapper.service';
import { basicAuthInterceptor } from './app/interceptors/basic-auth.interceptor';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([
        ...(environment.useBasicAuth ? [basicAuthInterceptor] : [])
      ])
    ),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

    { provide: GET_AUTH_TOKEN, useValue: () => getAuth() },
  ],
});