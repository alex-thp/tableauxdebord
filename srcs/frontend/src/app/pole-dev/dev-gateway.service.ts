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

    getRapportXIndicateur(rapport_x_indicateur: string): Observable<any> {
      let params = new HttpParams().set('rapport_x_indicateur', rapport_x_indicateur.toString());
      return this.http.get(`${this.baseUrl}/indicateur`, { params });
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
      console.log('getIndicateurValue called with parameters:', {
        action,
        action_localite,
        sujet,
        sujet_critere,
        sujet_localite,
        sujet_indicateur,
        date_debut,
        date_fin
      });
      let params = new HttpParams()
      .set('action', action.toString())
      .set('action_localite', action_localite.toString())
      .set('sujet', sujet.toString())
      .set('sujet_critere', sujet_critere.toString())
      .set('sujet_localite', sujet_localite.toString())
      .set('sujet_indicateur', sujet_indicateur.toString());

      if (date_debut) {
        params = params.set('date_debut', date_debut.toString());
      }
      if (date_fin) {
        params = params.set('date_fin', date_fin.toString());
      }
      console.log('la fonction est bien déclenchée');
      return this.http.get(`${this.baseUrl}/indicateurValue`, { params });
    }
}
