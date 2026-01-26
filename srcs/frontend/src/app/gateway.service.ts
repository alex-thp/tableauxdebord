import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GatewayService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // -------------------
  // GÉNÉRAL
  // -------------------
  getData(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getViewData(
    mode: number,
    date_debut: Date | null,
    date_fin: Date | null
  ): Observable<any> {
    let params = new HttpParams().set('mode', mode.toString());
    if (date_debut) params = params.set('date_debut', date_debut.toISOString());
    if (date_fin) params = params.set('date_fin', date_fin.toISOString());
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

  // -------------------
  // UTILISATEURS / ADMIN
  // -------------------
  getUsersWithRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/with-roles`);
  }

  createUser(newUser: {
    email: string;
    password: string;
    roleId: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/create`, newUser);
  }

  updateUserRole(userId: number, roleId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/${userId}/roles`, { roleId });
  }

  adminChangePassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/change-password`, {
      userId,
      newPassword,
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/delete-user/${userId}`);
  }

  getAdminDashboardData(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getdashboardData(today: Date | null): Observable<any> {
    let params = new HttpParams();
    if (today) params = params.set('today', today.toISOString());
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/dashboard/data`, { params });
  }

  // -------------------
  // PDF / EXPORT
  // -------------------
  mergePdf(formData: FormData): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/pdf/merge`, formData, {
      headers: { Authorization: `Bearer ${token || ''}` },
      responseType: 'blob',
    });
  }

  mergePdfAtIndex(formData: FormData): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/pdf/mergeAtIndex`, formData, {
      headers: { Authorization: `Bearer ${token || ''}` },
      responseType: 'blob',
    });
  }

  generatePdfFromHtml(html: string): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.post(
      `${this.baseUrl}/pdf/generate`,
      { html },
      {
        headers: { Authorization: `Bearer ${token || ''}` },
        responseType: 'blob',
      }
    );
  }

  downloadBoussolePdf(html: string): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.post(
      `${this.baseUrl}/pdf/downloadBoussolePdf`,
      { html },
      {
        headers: { Authorization: `Bearer ${token || ''}` },
        responseType: 'blob',
      }
    );
  }

  benevolePdf(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pdf/benevolePdf`);
  }
}
