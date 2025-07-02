import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AskGeminiService {

  private baseUrl = '/api';

  constructor(private http: HttpClient) {}
  askGemini(question: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/gemini/default`, { question });
  }
}
