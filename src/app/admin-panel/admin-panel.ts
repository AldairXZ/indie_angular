import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../toast';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanelComponent implements OnInit {
  users: any[] = [];
  auditLogs: any[] = [];

  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  
  // URL de tu API
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api/admin';

  ngOnInit() {
    this.loadUsers();
    this.loadAuditLogs();
  }

  private getHeaders() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.router.navigate(['/login']);
    }
    return new HttpHeaders().set('authorization', `Bearer ${token}`);
  }

  loadUsers() {
    this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() }).subscribe({
      next: (data: any) => this.users = data,
      error: (err) => {
        console.error('Error al cargar usuarios', err);
        this.toast.error('No se pudieron cargar los usuarios.');
      }
    });
  }

  loadAuditLogs() {
    this.http.get(`${this.apiUrl}/logs`, { headers: this.getHeaders() }).subscribe({
      next: (data: any) => this.auditLogs = data,
      error: (err) => {
        console.error('Error al cargar bitácora', err);
        this.toast.error('No se pudo cargar la bitácora de auditoría.');
      }
    });
  }

  updateRole(userId: number, newRole: string) {
    if(confirm(`¿Estás seguro de cambiar el grupo/rol a ${newRole}?`)) {
      this.http.put(`${this.apiUrl}/users/${userId}/role`, { role: newRole }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.toast.success('Rol asignado correctamente.');
          this.loadAuditLogs();
        },
        error: (err) => this.toast.error('Error al actualizar el rol.')
      });
    }
  }

  toggleStatus(userId: number, isActive: boolean) {
    const statusText = isActive ? 'habilitar' : 'deshabilitar';
    if(confirm(`¿Deseas ${statusText} esta cuenta de usuario?`)) {
      this.http.put(`${this.apiUrl}/users/${userId}/status`, { is_active: isActive }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.toast.success(`Cuenta ${isActive ? 'habilitada' : 'deshabilitada'} correctamente.`);
          this.loadUsers();
          this.loadAuditLogs(); 
        },
        error: (err) => this.toast.error(`Error al ${statusText} la cuenta.`)
      });
    }
  }

  logicalDelete(userId: number) {
    if(confirm('¿Confirmas ELIMINAR este usuario? Se perderá su configuración pero se mantendrá en registros de auditoría.')) {
      this.http.delete(`${this.apiUrl}/users/${userId}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.loadUsers();
          this.loadAuditLogs();
          this.toast.success('Usuario eliminado correctamente.');
        },
        error: (err) => this.toast.error('Error al eliminar usuario.')
      });
    }
  }
}