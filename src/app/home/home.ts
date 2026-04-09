import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  myGames: any[] = [];
  wishlistGames: any[] = [];

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api';

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit() {
    if (this.isAuthenticated) {
      this.loadAllUserData();
    } else {
      this.router.navigate(['/explorar']);
    }
  }

  loadAllUserData() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    const headers = new HttpHeaders().set('authorization', `Bearer ${token}`);

    this.http.get(`${this.apiUrl}/library`, { headers }).subscribe({
      next: (data: any) => {
        this.myGames = [...data];
        this.cdr.detectChanges();
      }
    });

    this.http.get(`${this.apiUrl}/wishlist`, { headers }).subscribe({
      next: (data: any) => {
        this.wishlistGames = [...data];
        this.cdr.detectChanges();
      }
    });
  }

  removeFromWishlist(gameId: number) {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('authorization', `Bearer ${token}`);

    this.http.delete(`${this.apiUrl}/wishlist/${gameId}`, { headers }).subscribe({
      next: () => {
        this.wishlistGames = this.wishlistGames.filter(g => g.id !== gameId);
        this.cdr.detectChanges();
      }
    });
  }
}
