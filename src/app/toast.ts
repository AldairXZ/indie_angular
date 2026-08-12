import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  toasts = signal<ToastMessage[]>([]);

  show(text: string, type: ToastType = 'success', duration = 3500) {
    const id = this.nextId++;
    const icon =
      type === 'success' ? 'bx bx-check-circle' :
      type === 'error' ? 'bx bx-x-circle' :
      'bx bx-info-circle';

    this.toasts.update(list => [...list, { id, text, type, icon }]);

    setTimeout(() => this.dismiss(id), duration);
  }

  success(text: string, duration = 3500) {
    this.show(text, 'success', duration);
  }

  error(text: string, duration = 3500) {
    this.show(text, 'error', duration);
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
