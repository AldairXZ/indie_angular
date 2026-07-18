import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importante: FormsModule es necesario para el [(ngModel)] de los roles
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanelComponent implements OnInit {
  users: any[] = [];
  auditLogs: any[] = [];

  private http = inject(HttpClient);
  private router = inject(Router);

  // Apunta a tu servidor de Render
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api/admin';

  ngOnInit() {
    this.loadUsers();
    this.loadAuditLogs();
  }

  // Genera los headers con el token JWT de seguridad
  private getHeaders() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.router.navigate(['/login']);
    }
    return new HttpHeaders().set('authorization', `Bearer ${token}`);
  }

  // 1. Cargar todos los usuarios (excluyendo eliminados lógicamente)
  loadUsers() {
    this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() }).subscribe({
      next: (data: any) => {
        this.users = data;
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  // 2. Cargar Bitácora de Auditoría
  loadAuditLogs() {
    this.http.get(`${this.apiUrl}/logs`, { headers: this.getHeaders() }).subscribe({
      next: (data: any) => {
        this.auditLogs = data;
      },
      error: (err) => console.error('Error al cargar bitácora', err)
    });
  }

  // 3. Cambiar Rol (Asignación de privilegios)
  updateRole(userId: number, newRole: string) {
    if(confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) {
      this.http.put(`${this.apiUrl}/users/${userId}/role`, { role: newRole }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert('Rol actualizado correctamente.');
          this.loadAuditLogs(); // Recargar bitácora para ver el cambio
        },
        error: (err) => alert('Error al actualizar el rol.')
      });
    }
  }

  // 4. Activar o Desactivar cuenta
  toggleStatus(userId: number, isActive: boolean) {
    const statusText = isActive ? 'activar' : 'desactivar';
    if(confirm(`¿Deseas ${statusText} este usuario?`)) {
      this.http.put(`${this.apiUrl}/users/${userId}/status`, { is_active: isActive }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.loadUsers(); // Recargar la tabla
          this.loadAuditLogs();
        },
        error: (err) => alert(`Error al ${statusText} la cuenta.`)
      });
    }
  }

  // 5. Eliminación Lógica
  logicalDelete(userId: number) {
    if(confirm('¿Estás seguro de eliminar este usuario? Sus datos se mantendrán en la base de datos por integridad, pero perderá acceso.')) {
      this.http.delete(`${this.apiUrl}/users/${userId}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.loadUsers(); // El usuario desaparecerá de la lista
          this.loadAuditLogs();
          alert('Usuario eliminado lógicamente.');
        },
        error: (err) => alert('Error al eliminar usuario.')
      });
    }
  }
}
