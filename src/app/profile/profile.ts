import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  profileForm: FormGroup;
  juegosDescargados: any[] = [];
  juegosDeseados: any[] = [];
  vistaActual = 'biblioteca';
  mensajeExito = '';

  constructor() {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      this.profileForm.patchValue({
        username: user.username,
        email: user.email
      });
    }
    this.cargarHistorial();
  }

  cargarHistorial() {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('https://indie-backend-wz13.onrender.com/api/library', { headers }).subscribe({
      next: (data) => this.juegosDescargados = data,
      error: (err) => console.error(err)
    });

    this.http.get<any[]>('https://indie-backend-wz13.onrender.com/api/wishlist', { headers }).subscribe({
      next: (data) => this.juegosDeseados = data,
      error: (err) => console.error(err)
    });
  }

  cambiarVista(vista: string) {
    this.vistaActual = vista;
  }

  eliminarDeseo(id: number) {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`https://indie-backend-wz13.onrender.com/api/wishlist/${id}`, { headers }).subscribe({
      next: () => {
        this.juegosDeseados = this.juegosDeseados.filter(j => j.id !== id);
      },
      error: (err) => console.error(err)
    });
  }

  actualizarPerfil() {
    if (this.profileForm.valid) {
      const token = localStorage.getItem('jwt_token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.put('https://indie-backend-wz13.onrender.com/api/users/me', this.profileForm.value, { headers }).subscribe({
        next: () => {
          this.mensajeExito = 'Perfil actualizado correctamente. Los cambios se reflejarán completamente en tu próximo inicio de sesión.';
          const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
          userData.username = this.profileForm.value.username;
          userData.email = this.profileForm.value.email;
          localStorage.setItem('user_data', JSON.stringify(userData));
        },
        error: (err) => console.error(err)
      });
    }
  }

  eliminarCuenta() {
    if (confirm('¿Estás absolutamente seguro de querer eliminar tu cuenta? Esta acción borrará todos tus datos y juegos adquiridos de forma permanente.')) {
      const token = localStorage.getItem('jwt_token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete('https://indie-backend-wz13.onrender.com/api/users/me', { headers }).subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/']);
        },
        error: (err) => console.error(err)
      });
    }
  }
}
