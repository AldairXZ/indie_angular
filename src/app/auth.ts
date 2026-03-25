import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api';

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  hasPermission(permission: string): boolean {
    const userData = localStorage.getItem('user_data');
    if (!userData) return false;

    const user = JSON.parse(userData);
    return user.permissions && user.permissions.includes(permission);
  }
}
