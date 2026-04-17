import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './foro.html',
  styleUrls: ['./foro.css']
})
export class Foro {
  posts = [
    { id: 1, author: 'DevMaster', date: new Date('2026-04-10T10:00:00'), tag: 'Desarrollo', title: '¿Cómo optimizar colisiones en Godot?', content: 'Estoy trabajando en un juego de plataformas y noto caída de frames al tener muchos enemigos...', comments: 15, likes: 42 },
    { id: 2, author: 'PixelArtist99', date: new Date('2026-04-12T14:30:00'), tag: 'Arte', title: 'Mi nueva paleta de colores cyberpunk', content: 'Quiero compartir esta paleta que diseñé para mi próximo metroidvania. ¿Qué opinan del contraste?', comments: 8, likes: 120 },
    { id: 3, author: 'IndieDevMX', date: new Date('2026-04-15T09:15:00'), tag: 'General', title: 'Buscando compositor para RPG', content: 'Hola a todos, mi equipo y yo buscamos un músico especializado en chiptune para un proyecto de 6 meses.', comments: 4, likes: 19 }
  ];

  nuevoTema() {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (!userData.two_factor_enabled) {
      alert('🔒 Seguridad requerida: Debes activar la verificación en dos pasos en tu Perfil para publicar en el foro.');
      return;
    }
    alert('Abriendo editor de nuevo tema...');
  }
}
