import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GatewayService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

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

  getAdminDashboardData(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  getdashboardData(today: Date | null): Observable<any> {
    let params = new HttpParams()
    // Ajoute seulement les paramètres non-nuls
    if (today) {
      params = params.set('today', today.toISOString());
    }
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/dashboard/data`, { params });
  }

  mergePdf(formData: FormData): Observable<Blob> {
    const token = localStorage.getItem('token');

    return this.http.post(`${this.baseUrl}/pdf/merge`, formData, {
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
      responseType: 'blob', // pour pouvoir télécharger le PDF
    });
  }

  mergePdfAtIndex(formData: FormData): Observable<Blob> {
    const token = localStorage.getItem('token');

    return this.http.post(`${this.baseUrl}/pdf/mergeAtIndex`, formData, {
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
      responseType: 'blob', // pour pouvoir télécharger le PDF
    });
  }

  generatePdfFromHtml(html: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/pdf/generate`, { html }, {
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
      responseType: 'blob', // pour pouvoir télécharger le PDF
    });
  }

//downloadBoussolePdf

  downloadBoussolePdf(html: string): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/pdf/downloadBoussolePdf`, { html }, {
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
      responseType: 'blob', // pour pouvoir télécharger le PDF
    });
  }

  benevolePdf(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pdf/benevolePdf`);
  }
}
