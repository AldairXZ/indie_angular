import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth';
import { BiometricService } from '../biometric';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  private authService = inject(AuthService);
  private biometricService = inject(BiometricService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isBiometricAvailable = this.biometricService.isWebAuthnAvailable();

  loginTradicional() {
    if (this.email && this.password) {
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: () => {
          this.errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        }
      });
    }
  }

async loginWithBiometrics() {
    this.errorMessage = '';

    // CORRECCIÓN: Se agregó la ruta /api/webauthn/login/options
    this.http.post('https://indie-backend-wz13.onrender.com/api/webauthn/login/options', {}).subscribe({
      next: async (options: any) => {
        try {
          // Procesar el challenge que viene del servidor
          options.challenge = this.base64ToUint8Array(options.challenge);

          // Importante: Si el servidor envía allowCredentials, hay que procesar los IDs
          if (options.allowCredentials) {
            options.allowCredentials = options.allowCredentials.map((cred: any) => ({
              ...cred,
              id: this.base64ToUint8Array(cred.id)
            }));
          }

          // Esto abre la ventanita del navegador para la huella/rostro
          const credential: any = await navigator.credentials.get({ publicKey: options });

          const credentialForServer = {
            id: credential.id,
            type: credential.type,
            response: {
              authenticatorData: this.arrayBufferToBase64(credential.response.authenticatorData),
              clientDataJSON: this.arrayBufferToBase64(credential.response.clientDataJSON),
              signature: this.arrayBufferToBase64(credential.response.signature),
              userHandle: credential.response.userHandle ? this.arrayBufferToBase64(credential.response.userHandle) : null
            }
          };

          this.http.post('https://indie-backend-wz13.onrender.com/api/webauthn/login/verify', { credential: credentialForServer }).subscribe({
            next: (response: any) => {
              localStorage.setItem('jwt_token', response.token);
              localStorage.setItem('user_data', JSON.stringify(response.user));
              this.router.navigate(['/']);
            },
            error: () => {
              this.errorMessage = 'Huella no reconocida o no registrada en el sistema.';
            }
          });

        } catch (error) {
          console.error('Error en biometría:', error);
          this.errorMessage = 'Autenticación biométrica cancelada o fallida.';
        }
      },
      error: (err) => {
        console.error('Error de red:', err);
        this.errorMessage = 'Error al contactar con el servidor de seguridad.';
      }
    });
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
