import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publish-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './publish-game.html',
  styleUrls: ['./publish-game.css']
})
export class PublishGameComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  categorias: any[] = [];
  mensajeExito = '';
  mensajeError = '';

  publishForm: FormGroup = this.fb.group({
    categoryId: ['', Validators.required],
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(20)]],
    price: [0, [Validators.required, Validators.min(0)]],
    downloadUrl: ['', Validators.required],
    imageUrl: ['', Validators.required]
  });

  ngOnInit() {
    this.http.get<any[]>('https://indie-backend-wz13.onrender.com/api/categories').subscribe({
      next: (data) => this.categorias = data,
      error: () => this.mensajeError = 'Error al cargar las categorías'
    });
  }

  onSubmit() {
    if (this.publishForm.valid) {
      this.http.post('https://indie-backend-wz13.onrender.com/api/games', this.publishForm.value).subscribe({
        next: () => {
          this.mensajeExito = '¡Juego publicado con éxito!';
          this.publishForm.reset();
          setTimeout(() => this.router.navigate(['/explorar']), 2000);
        },
        error: () => this.mensajeError = 'Error al publicar el juego'
      });
    }
  }
}
