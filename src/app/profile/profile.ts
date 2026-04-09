import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <-- Importante para usar [(ngModel)]

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Lo agregamos aquí
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  usuario: any = null;

  // Variables para el 2FA
  showEmailCodeInput = false;
  twoFactorCode = '';

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api';

  ngOnInit() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      this.usuario = JSON.parse(userData);
      this.cdr.detectChanges();
    }
  }

  solicitarCodigo2FA() {
    // Aquí más adelante haremos la petición al backend para que envíe el correo
    // this.http.post(`${this.apiUrl}/2fa/send-email`, { email: this.usuario.email }).subscribe(...)

    alert(`Te hemos enviado un código de seguridad a ${this.usuario?.email}`);
    this.showEmailCodeInput = true;
    this.cdr.detectChanges();
  }

  verificarCodigo2FA() {
    if (!this.twoFactorCode || this.twoFactorCode.length < 4) {
      alert('Por favor ingresa un código válido');
      return;
    }

    // Aquí validaremos el código con el backend
    /*
    this.http.post(`${this.apiUrl}/2fa/verify`, { userId: this.usuario.id, code: this.twoFactorCode }).subscribe({
      next: () => { ... }
    });
    */

    // Simulación de éxito por ahora:
    alert('¡Doble autenticación por correo activada correctamente!');
    this.showEmailCodeInput = false;

    // Actualizamos el usuario localmente para mostrar el escudo verde
    this.usuario.two_factor_enabled = true;
    localStorage.setItem('user_data', JSON.stringify(this.usuario));

    this.cdr.detectChanges();
  }
}
