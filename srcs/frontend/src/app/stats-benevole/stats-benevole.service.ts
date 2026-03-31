import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatsBenevoleService {
  private baseUrl = '/api/stats-benevole';

  constructor(private http: HttpClient) {}

  async getStatsByTheme(): Promise<Observable<any>> {
    return this.http.get(`${this.baseUrl}/stats-by-theme`);
  }
}
