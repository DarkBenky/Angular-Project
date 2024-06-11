import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenderizeService {

  private apiUrl = 'https://api.genderize.io';

  constructor(private http: HttpClient) { }

  getGender(name: string): Observable<any> {
    const url = `${this.apiUrl}/?name=${name}`;
    return this.http.get<any>(url);
  }
}