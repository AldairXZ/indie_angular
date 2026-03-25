import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { BiometricService } from '../biometric';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private biometricService = inject(BiometricService);

  errorMessage = '';
  successMessage = '';

  registeredUser: { id: number, username: string } | null = null;
  biometricStep = false;
  biometricStatus = '';

  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email, this.uteqEmailValidator]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['player', Validators.required]
  });

  uteqEmailValidator(control: AbstractControl) {
    const email = control.value;
    if (email && !email.endsWith('@uteq.edu.mx')) {
      return { invalidDomain: true };
    }
    return null;
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength')) return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres.`;
    if (control.hasError('email')) return 'Formato de correo inválido.';
    if (control.hasError('invalidDomain')) return 'Debe ser un correo @uteq.edu.mx';

    return 'Campo inválido.';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.valid) {
      this.http.post('https://indie-backend-wz13.onrender.com/api/register', this.registerForm.value).subscribe({
        next: (response: any) => {
          this.successMessage = 'Cuenta base creada. Vamos a configurar la seguridad.';
          this.registeredUser = { id: response.id, username: response.username };
          this.biometricStep = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Error al registrar la cuenta.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  async registrarHuella() {
    if (!this.registeredUser) return;
    this.biometricStatus = 'Solicitando permisos a la PC...';

    this.http.post('https://indie-backend-wz13.onrender.com/api/webauthn/register/options', {
      userId: this.registeredUser.id,
      username: this.registeredUser.username
    }).subscribe({
      next: async (options: any) => {
        try {
          this.biometricStatus = 'Usa tu lector de huella o Windows Hello...';

          options.challenge = this.base64ToUint8Array(options.challenge);
          options.user.id = new TextEncoder().encode(options.user.id);

          const credential = await navigator.credentials.create({ publicKey: options });

          this.biometricStatus = 'Verificando con el servidor...';
          this.verificarCredencialEnServidor(credential);
        } catch (error) {
          this.biometricStatus = 'Error al registrar huella: ' + error;
          console.error(error);
        }
      }
    });
  }

  verificarCredencialEnServidor(credential: any) {
    const credentialForServer = {
      id: credential.id,
      type: credential.type,
      response: {
        attestationObject: this.arrayBufferToBase64(credential.response.attestationObject),
        clientDataJSON: this.arrayBufferToBase64(credential.response.clientDataJSON)
      }
    };

    this.http.post('https://indie-backend-wz13.onrender.com/api/webauthn/register/verify', {
      userId: this.registeredUser?.id,
      credential: credentialForServer
    }).subscribe({
      next: () => {
        this.biometricStatus = '✅ Huella registrada exitosamente.';
        setTimeout(() => this.finalizarRegistro(), 1500);
      },
      error: () => this.biometricStatus = '❌ Error final en el servidor.'
    });
  }

  finalizarRegistro() {
    this.router.navigate(['/login']);
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
