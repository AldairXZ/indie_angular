import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

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

  misJuegosPublicados: any[] = [];
  categorias: any[] = [];
  searchTerm = '';

  juegoEnEdicion: any = null;
  mostrarModal = false;
  isEditing = false;

  gameForm: FormGroup;

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
    this.http.get<any[]>('https://indie-backend-wz13.onrender.com/api/categories').subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      }
    });
  }

  cargarMisJuegos() {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('https://indie-backend-wz13.onrender.com/api/my-games', { headers }).subscribe({
      next: (data) => {
        this.misJuegosPublicados = data;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredGames() {
    return this.misJuegosPublicados.filter(juego =>
      juego.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  abrirModalPublicar() {
    this.isEditing = false;
    this.juegoEnEdicion = null;
    this.gameForm.reset({ price: 0 });
    this.mostrarModal = true;
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
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.juegoEnEdicion = null;
    this.gameForm.reset();
  }

  guardarJuego() {
    if (this.gameForm.invalid) return;

    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const data = this.gameForm.value;

    if (this.isEditing) {
      this.http.put(`https://indie-backend-wz13.onrender.com/api/games/${this.juegoEnEdicion.id}`, data, { headers }).subscribe({
        next: () => {
          this.cargarMisJuegos();
          this.cerrarModal();
        }
      });
    } else {
      this.http.post('https://indie-backend-wz13.onrender.com/api/games', data, { headers }).subscribe({
        next: () => {
          this.cargarMisJuegos();
          this.cerrarModal();
        }
      });
    }
  }

  eliminarJuego(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este juego de forma permanente?')) {
      const token = localStorage.getItem('jwt_token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`https://indie-backend-wz13.onrender.com/api/games/${id}`, { headers }).subscribe({
        next: () => {
          this.misJuegosPublicados = this.misJuegosPublicados.filter(juego => juego.id !== id);
          this.cdr.detectChanges();
        }
      });
    }
  }
}
