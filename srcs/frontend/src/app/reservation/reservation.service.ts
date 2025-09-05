import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private baseUrl = '/api/reservation';

  //let params = new HttpParams();

  constructor(private http: HttpClient) { }

  verifyPrescriptionAvailability(prescriptionId: string): Observable<any> {
    let params = new HttpParams().set('prescriptionId', prescriptionId);
    return this.http.get(`${this.baseUrl}/verifyPrescription`, { params });
  }

  setPrescriptionOnSlot(prescriptionId: string, cdpId: string): Observable<any> {
    const body = { prescriptionId, cdpId };

    return this.http.post(`${this.baseUrl}/setPrescriptionOnSlot`, body);
  }

  getAvailableSlots(record_id: string): Observable<any> {
    let params = new HttpParams().set('record_id', record_id);
    return this.http.get(`${this.baseUrl}/availableSlots`, { params });
  }

  eraseOldSlot(slotId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/eraseOldSlot`, { slotId });
  }
}
