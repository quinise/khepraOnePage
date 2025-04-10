import { Injectable } from '@angular/core';
import { Service } from '../interfaces/service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  services: Service[] = [];
  service: Service | {} = {};
}

// id,
// type,
// name,
// email,
// phone_number,
// date,
// isVirtual
