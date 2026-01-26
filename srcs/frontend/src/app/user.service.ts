import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = '/api/user';

  constructor(private http: HttpClient) {}

  updateUserRoles(userId: number, roleId: number) {
    return this.http.put(`/api/user/${userId}/roles`, { roleId });
  }

  getUserByEmail(email: string) {
    return this.http.get<any>(`${this.apiUrl}/by-email/${email}`);
  }
}
