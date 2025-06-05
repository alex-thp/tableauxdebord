import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
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

<<<<<<< Updated upstream
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
=======
  getIndicateurValue(formulaire: FormGroup): Observable<any> {
    const {
      action,
      action_localite,
      sujet,
      sujet_critere,
      sujet_localite,
      sujet_indicateur,
      date_debut,
      date_fin
    } = formulaire.value;
  
    let params = new HttpParams()
>>>>>>> Stashed changes
      .set('action', action.toString())
      .set('sujet', sujet.toString())
      .set('sujet_indicateur', sujet_indicateur.toString())
        // Append les éléments un par un pour qu'ils soient reçus comme tableau côté backend
      action_localite.forEach((loc: string) => {
        params = params.append('action_localite', loc);
      });

<<<<<<< Updated upstream
      if (date_debut) {
        params = params.set('date_debut', date_debut.toString());
      }
      if (date_fin) {
        params = params.set('date_fin', date_fin.toString());
      }
      console.log('la fonction est bien déclenchée');
      return this.http.get(`${this.baseUrl}/indicateurValue`, { params });
=======
      sujet_critere.forEach((crit: string) => {
        console.log(crit)
        params = params.append('sujet_critere', crit);
      });

      sujet_localite.forEach((loc: string) => {
        params = params.append('sujet_localite', loc);
      });;
  
    if (date_debut) {
      params = params.set('date_debut', new Date(date_debut).toISOString());
    }
  
    if (date_fin) {
      params = params.set('date_fin', new Date(date_fin).toISOString());
>>>>>>> Stashed changes
    }
  
    console.log('la fonction est bien déclenchée');
  
    return this.http.get(`${this.baseUrl}/indicateurValue`, { params });
  }
}
