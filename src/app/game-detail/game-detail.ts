import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-detail.html',
  styleUrls: ['./game-detail.css']
})
export class GameDetailComponent implements OnInit {
  game: any = null;
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = 'https://indie-backend-wz13.onrender.com/api';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGameDetails(id);
    }
  }

  loadGameDetails(id: string) {
    this.http.get(`${this.apiUrl}/games/${id}`).subscribe({
      next: (data: any) => {
        this.game = data;
        this.cdr.detectChanges();
      }
    });
  }

  addToLibrary() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    const headers = new HttpHeaders().set('authorization', `Bearer ${token}`);
    this.http.post(`${this.apiUrl}/library`, { productId: this.game.id }, { headers }).subscribe({
      next: () => alert('Añadido correctamente')
    });
  }
}
