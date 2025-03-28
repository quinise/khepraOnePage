import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Service } from '../interfaces/service';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor() {}

  private _data = new BehaviorSubject<Service>({} as Service);
  public data$ = this._data.asObservable();

  setServiceDetails(type: string, name: string, email: string, phone_number: number, date: Date, time: Date, isVirtual: boolean) {
    if (name) {
      this._data.next({
        // TODO: hardcoded ID number
        id: 0,
        type: type,
        name: name,
        email: email,
        phone_number: phone_number,
        date: date,
        time: time,
        isVirtual: isVirtual
      } as Service);
    } else {
      this._data.next({} as Service);
    }
  }

  getServiceDetails(): Observable<Service> {
    return this._data;
  }
}
