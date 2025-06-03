import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DevGatewayService {
  private baseUrl = '/api/dev';

  constructor(private http: HttpClient) {}

  getTest() : Observable<any> {
    return this.http.get(`${this.baseUrl}/test`);
  }

    getIndicateurValue(
      action: string,
      action_localite: [string],
      sujet: string,
      sujet_critere: string,
      sujet_localite: [string],
      sujet_indicateur: string,
      date_debut: Date | null,
      date_fin: Date | null
    ): Observable<any> {
      let params = new HttpParams()
      .set('action', action.toString())
      .set('action_localite', action_localite.toString())
      .set('sujet', sujet.toString())
      .set('sujet_critere', sujet_critere.toString())
      .set('sujet_localite', sujet_localite.toString())
      .set('sujet_indicateur', sujet_indicateur.toString());

      if (date_debut) {
        params = params.set('date_debut', date_debut.toISOString());
      }
      if (date_fin) {
        params = params.set('date_fin', date_fin.toISOString());
      }
      console.log('la fonction est bien déclenchée');
      return this.http.get(`${this.baseUrl}/indicateurValue`, { params });
    }
}
