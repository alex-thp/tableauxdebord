import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private baseUrl = '/api/reservation';

  //let params = new HttpParams();

  constructor(private http: HttpClient) {}

  verifyPrescriptionAvailability(prescriptionId: string): Observable<any> {
    let params = new HttpParams().set('prescriptionId', prescriptionId);
    return this.http.get(`${this.baseUrl}/verifyPrescription`, { params });
  }

  setPrescriptionOnSlot(
    prescriptionId: string,
    cdpId: string,
    heure_rdv: string,
  ): Observable<any> {
    const body = { prescriptionId, cdpId, heure_rdv };

    return this.http.post(`${this.baseUrl}/setPrescriptionOnSlot`, body);
  }

  getAvailableSlots(record_id: string): Observable<any> {
    let params = new HttpParams().set('record_id', record_id);
    return this.http.get(`${this.baseUrl}/availableSlots`, { params });
  }

  getCdpEnrCand(
    candidat_nom: string,
    candidat_prenom: string,
    candidat_date_naissance: string,
  ): Observable<any> {
    console.log(
      'Fetching CDP Enr Cand with:',
      candidat_nom,
      candidat_prenom,
      candidat_date_naissance,
    );
    let params = new HttpParams()
      .set('candidat_nom', candidat_nom)
      .set('candidat_prenom', candidat_prenom)
      .set('candidat_date_naissance', candidat_date_naissance);
    return this.http.get(`${this.baseUrl}/cdpEnrCand`, { params });
  }

  getReservationSlots(reservation_record_id: string): Observable<any> {
    let params = new HttpParams().set(
      'reservation_record_id',
      reservation_record_id,
    );
    return this.http.get(`${this.baseUrl}/reservationSlots`, { params });
  }

  eraseOldSlot(slotId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/eraseOldSlot`, { slotId });
  }
}
