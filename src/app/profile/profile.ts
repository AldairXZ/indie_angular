import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      this.usuario = JSON.parse(userData);
      this.cdr.detectChanges();
    }
  }
}
