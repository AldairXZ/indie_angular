import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './explore.html',
  styleUrls: ['./explore.css']
})
export class ExploreComponent implements OnInit, OnDestroy {
  allGames: any[] = [];
  filteredGames: any[] = [];
  categories: string[] = ['Todos'];
  selectedCategory: string = 'Todos';
  searchTerm: string = '';

  currentSlide = 0;
  slideInterval: any;
  featuredGames = [
    { id: 1, title: 'Cyber Neon City', description: 'Explora un mundo distópico lleno de neón, acción y decisiones que cambiarán la historia.', image_url: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1200&auto=format&fit=crop', price: 14.99, tag: 'Novedad Mundial' },
    { id: 2, title: 'Fantasy Quest', description: 'Un RPG de mundo abierto donde forjarás tu propio destino entre dragones y magia antigua.', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop', price: 9.99, tag: 'Oferta Especial -50%' },
    { id: 3, title: 'Space Frontier', description: 'Construye, sobrevive y conquista planetas en este simulador de supervivencia espacial.', image_url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1200&auto=format&fit=crop', price: 0, tag: 'Juega Gratis' }
  ];

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api';

  ngOnInit() {
    this.loadGames();
    this.startCarousel();
  }

  ngOnDestroy() {
    this.stopCarousel();
  }

  startCarousel() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
      this.cdr.detectChanges();
    }, 5000);
  }

  stopCarousel() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.featuredGames.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.featuredGames.length) % this.featuredGames.length;
  }

  setSlide(index: number) {
    this.currentSlide = index;
    this.stopCarousel();
    this.startCarousel();
  }

  loadGames() {
    this.http.get(`${this.apiUrl}/games`).subscribe({
      next: (data: any) => {
        this.allGames = data;
        this.filteredGames = [...this.allGames];
        const uniqueCats = Array.from(new Set(this.allGames.map(g => g.category)));
        this.categories = ['Todos', ...uniqueCats];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  filterGames() {
    this.filteredGames = this.allGames.filter(game => {
      const titleMatch = game.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const catSearchMatch = game.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesSearch = titleMatch || catSearchMatch;
      const matchesCategory = this.selectedCategory === 'Todos' || game.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
    this.cdr.detectChanges();
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
    this.filterGames();
  }

  addToLibrary(gameId: number) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert('Debes iniciar sesión para añadir juegos.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post(`${this.apiUrl}/library`, { productId: gameId }, { headers }).subscribe({
      next: () => {
        this.router.navigate(['/juego', gameId]);
      },
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
      next: () => alert('Añadido a tu lista de deseos.'),
      error: (err) => console.error(err)
    });
  }
}
