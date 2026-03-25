import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isSidebarCollapsed = false;
  isAuthRoute = false;

    constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthRoute = event.url === '/login' || event.url === '/register' || event.urlAfterRedirects === '/login' || event.urlAfterRedirects === '/register';
    });
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
