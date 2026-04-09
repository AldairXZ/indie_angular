import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- 1. Importar
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  myGames: any[] = [];
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // <-- 2. Inyectar
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api';

  ngOnInit() {
    this.loadLibrary();
  }

  loadLibrary() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`${this.apiUrl}/library`, { headers }).subscribe({
      next: (data: any) => {
        this.myGames = data;
        this.cdr.detectChanges(); // <-- 3. Forzar el redibujado de la pantalla
      },
      error: (err) => console.error(err)
    });
  }
}
