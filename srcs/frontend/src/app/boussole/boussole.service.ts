import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoussoleService {
  private baseUrl = '/api/boussole';

  constructor(private http: HttpClient) {}
  getBoussoleData(date_debut: Date, date_fin: Date): Observable<any> {
    let params = new HttpParams();

    if (date_debut) {
      params = params.set('date_debut', date_debut.toISOString());
    }
    if (date_fin) {
      params = params.set('date_fin', date_fin.toISOString());
    }
    return this.http.get(`${this.baseUrl}/data`, { params });
  }
}
