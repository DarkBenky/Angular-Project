import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostCode {
  private apiUrl = 'https://api.zippopotam.us/us';

  constructor(private http: HttpClient) {}

  getPost(postcode: string): Observable<any> {
    const url = `${this.apiUrl}/${postcode}`;
    return this.http.get<any>(url);
  }
}