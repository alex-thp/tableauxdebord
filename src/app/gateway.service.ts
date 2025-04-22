import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getViewData(mode: number): Observable<any> {    
    return this.http.get(`${this.baseUrl}/view/${mode}`);
  }

  getChartData(mode: number): Observable<any> {    
    return this.http.get(`${this.baseUrl}/chart/${mode}`);
  }

  getSortiesData(): Observable<any> {    
    return this.http.get(`${this.baseUrl}/sortie`);
  }

  // Exemple de méthode POST
  postData(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, data);
  }
}
