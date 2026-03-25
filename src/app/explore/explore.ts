import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.html',
  styleUrls: ['./explore.css']
})
export class ExploreComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private authService = inject(AuthService);

  searchTerm = '';
  selectedCategory = 'Todos';
  categorias: string[] = ['Todos'];
  juegos: any[] = [];

  juegoSeleccionado: any = null;
  mensajeModal: string = '';

  ngOnInit() {
    this.http.get<any[]>('https://indie-backend-wz13.onrender.com/api/games').subscribe({
      next: (data) => {
        this.juegos = data.map(game => ({
          ...game,
          imagen: game.imagen || game.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300'
        }));

        const uniqueCategories = new Set(data.map(item => item.category));
        this.categorias = ['Todos', ...Array.from(uniqueCategories)];

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  get filteredGames() {
    return this.juegos.filter(juego => {
      const matchCategory = this.selectedCategory === 'Todos' || juego.category === this.selectedCategory;
      const matchSearch = juego.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }

  setCategory(categoria: string) {
    this.selectedCategory = categoria;
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
