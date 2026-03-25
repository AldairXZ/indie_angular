import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  juegosDestacados: any[] = [];
  juegoSeleccionado: any = null;
  mensajeModal: string = '';

  ngOnInit() {
    this.http.get<any[]>('https://indie-backend-wz13.onrender.com/api/games').subscribe({
      next: (data) => {
        this.juegosDestacados = data.slice(0, 6);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  abrirModal(juego: any) {
    this.juegoSeleccionado = juego;
    this.mensajeModal = '';
  }

  cerrarModal() {
    this.juegoSeleccionado = null;
    this.mensajeModal = '';
  }

  agregarDeseo(id: number) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('https://indie-backend-wz13.onrender.com/api/wishlist', { productId: id }, { headers }).subscribe({
      next: () => {
        this.mensajeModal = '¡Añadido a tu lista de deseos!';
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeModal = 'Hubo un error al añadir a la lista.';
        this.cdr.detectChanges();
      }
    });
  }

  adquirirJuego(id: number) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('https://indie-backend-wz13.onrender.com/api/library', { productId: id }, { headers }).subscribe({
      next: () => {
        this.mensajeModal = '¡Añadido a tu biblioteca con éxito!';
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeModal = 'Hubo un error al adquirir el juego.';
        this.cdr.detectChanges();
      }
    });
  }
}
