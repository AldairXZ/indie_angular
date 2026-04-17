import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-games',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manage-games.html',
  styleUrls: ['./manage-games.css']
})
export class ManageGamesComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  misJuegosPublicados: any[] = [];
  filteredGames: any[] = [];
  categorias: any[] = [];
  searchTerm = '';
  juegoEnEdicion: any = null;
  mostrarModal = false;
  isEditing = false;
  gameForm: FormGroup;
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api';

  constructor() {
    this.gameForm = this.fb.group({
      categoryId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      downloadUrl: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarCategorias();
    this.cargarMisJuegos();
  }

  cargarCategorias() {
    this.http.get<any[]>(`${this.apiUrl}/categories`).subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  cargarMisJuegos() {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>(`${this.apiUrl}/my-games`, { headers }).subscribe({
      next: (data) => {
        this.misJuegosPublicados = data;
        this.actualizarFiltro();
      },
      error: (err) => console.error(err)
    });
  }

  actualizarFiltro() {
    if (!this.searchTerm) {
      this.filteredGames = [...this.misJuegosPublicados];
    } else {
      this.filteredGames = this.misJuegosPublicados.filter(juego =>
        juego.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.cdr.detectChanges();
  }

  onSearchChange() {
    this.actualizarFiltro();
  }

  abrirModalPublicar() {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (!userData.two_factor_enabled) {
      alert('Acción bloqueada: Debes verificar tu cuenta con 2FA en tu Perfil para poder subir juegos.');
      this.router.navigate(['/profile']);
      return;
    }
    this.isEditing = false;
    this.juegoEnEdicion = null;
    this.gameForm.reset({ price: 0, categoryId: '' });
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(juego: any) {
    this.isEditing = true;
    this.juegoEnEdicion = juego;
    this.gameForm.patchValue({
      categoryId: juego.category_id,
      title: juego.title,
      description: juego.description,
      price: juego.price,
      imageUrl: juego.image_url,
      downloadUrl: juego.download_url
    });
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.juegoEnEdicion = null;
    this.gameForm.reset();
    this.cdr.detectChanges();
  }

  guardarJuego() {
    if (this.gameForm.invalid) return;
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const data = this.gameForm.value;

    if (this.isEditing) {
      this.http.put(`${this.apiUrl}/games/${this.juegoEnEdicion.id}`, data, { headers }).subscribe({
        next: () => {
          this.cargarMisJuegos();
          this.cerrarModal();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.http.post(`${this.apiUrl}/games`, data, { headers }).subscribe({
        next: () => {
          this.cargarMisJuegos();
          this.cerrarModal();
        },
        error: (err) => console.error(err)
      });
    }
  }

  eliminarJuego(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este juego de forma permanente?')) {
      const token = localStorage.getItem('jwt_token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.delete(`${this.apiUrl}/games/${id}`, { headers }).subscribe({
        next: () => {
          this.misJuegosPublicados = this.misJuegosPublicados.filter(juego => juego.id !== id);
          this.actualizarFiltro();
        },
        error: (err) => console.error(err)
      });
    }
  }
}
