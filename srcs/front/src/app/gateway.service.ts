import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GatewayService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000';
  private response : any = "";
  constructor() { }

  getData(): Observable<any> {    
    return this.http.get(`${this.baseUrl}`);
  }

  getViewData(mode: number, date_debut: Date | null, date_fin: Date | null): Observable<any> {
    let params = new HttpParams().set('mode', mode.toString());
  
    // Ajoute seulement les paramètres non-nuls
    if (date_debut) {
      params = params.set('date_debut', date_debut.toISOString());
    }
    if (date_fin) {
      params = params.set('date_fin', date_fin.toISOString());
    }
    return this.http.get(`${this.baseUrl}/view`, { params });
  }

  updateDataBase(): Observable<any> {
    return this.http.get(`${this.baseUrl}/updateDataBase`);
  }

  getChartData(mode: number): Observable<any> {    
    return this.http.get(`${this.baseUrl}/chart/${mode}`);
  }

  getSortiesData(): Observable<any> {    
    return this.http.get(`${this.baseUrl}/sortie`);
  }

  postData(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, data);
  }
}
