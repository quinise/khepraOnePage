import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthWrapperService } from '../services/authentication/auth-wrapper.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  constructor(private http: HttpClient, private authWrapper: AuthWrapperService) { }

  checkForConflicts(availability: any): Observable<boolean> {
    return this.http.post<boolean>('/api/appointments/check-conflict', availability);
  }

  updateAvailability(id: number, availability: any): Observable<any> {
    // Get the current user ID token from Firebase
    return this.authWrapper.getAuth().currentUser?.getIdToken().then(token => {
      if (token) {
        // Create the Authorization header with the Bearer token
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        // Make the PUT request to update availability and return the observable
        return this.http.put(`/api/availability/${id}`, availability, { headers });
      } else {
        // Handle the case where token is not available
        throw new Error('User token is not available');
      }
    }) as any; // Cast to 'any' to indicate it returns an observable (fix for Promise<Observable>)
  }
}