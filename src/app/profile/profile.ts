import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  usuario: any = null;
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
    this.http.post(`${this.apiUrl}/2fa/send-email`, { email: this.usuario.email }).subscribe({
      next: () => {
        alert(`Te hemos enviado un código de seguridad a ${this.usuario?.email}`);
        this.showEmailCodeInput = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Hubo un error al intentar enviar el correo. Inténtalo más tarde.');
      }
    });
  }

  verificarCodigo2FA() {
    if (!this.twoFactorCode || this.twoFactorCode.length < 6) {
      alert('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    const body = {
      userId: this.usuario.id,
      email: this.usuario.email,
      code: this.twoFactorCode
    };

    this.http.post(`${this.apiUrl}/2fa/verify`, body).subscribe({
      next: () => {
        alert('¡Doble autenticación por correo activada correctamente!');
        this.showEmailCodeInput = false;

        this.usuario.two_factor_enabled = true;
        localStorage.setItem('user_data', JSON.stringify(this.usuario));

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('El código es incorrecto o ha expirado. Por favor, intenta de nuevo.');
      }
    });
  }
}
