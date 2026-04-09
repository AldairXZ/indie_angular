import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- 1. Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './explore.html',
  styleUrls: ['./explore.css']
})
export class ExploreComponent implements OnInit {
  allGames: any[] = [];
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // <-- 2. Lo inyectamos aquí
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api';

  ngOnInit() {
    this.loadGames();
  }

  loadGames() {
    this.http.get(`${this.apiUrl}/games`).subscribe({
      next: (data: any) => {
        this.allGames = data;
        this.cdr.detectChanges(); // <-- 3. ¡La magia! Obligamos a la pantalla a actualizarse
      },
      error: (err) => console.error(err)
    });
  }

  // ... (tus funciones addToLibrary y addToWishlist se quedan exactamente igual)
  addToLibrary(gameId: number) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert('Debes iniciar sesión para añadir juegos.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post(`${this.apiUrl}/library`, { productId: gameId }, { headers }).subscribe({
      next: () => alert('¡Juego añadido a tu biblioteca!'),
      error: (err) => console.error(err)
    });
  }

  addToWishlist(gameId: number) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert('Debes iniciar sesión para añadir a deseados.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post(`${this.apiUrl}/wishlist`, { productId: gameId }, { headers }).subscribe({
      next: () => alert('¡Añadido a tu lista de deseos!'),
      error: (err) => console.error(err)
    });
  }
}
