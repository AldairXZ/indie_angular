import { Routes } from '@angular/router';
import { TermsOfUse } from './terms-of-use/terms-of-use';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { ProfileComponent } from './profile/profile';
import { ExploreComponent } from './explore/explore';
import { ManageGamesComponent } from './manage-games/manage-games';
import { authGuard } from './auth-guard';
import { RegisterComponent } from './register/register';
import { Foro } from './foro/foro';
import { Reportes } from './reportes/reportes';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Inicio - Indie Games' },
  { path: 'foro', component: Foro },
  { path: 'reportes', component: Reportes },
  { path: 'register', component: RegisterComponent, title: 'Crear Cuenta - Indie Games' },
  { path: 'explorar', component: ExploreComponent, title: 'Explorar - Indie Games' },
  { path: 'login', component: LoginComponent, title: 'Iniciar Sesión - Indie Games' },
  { path: 'panel-desarrollador', component: ManageGamesComponent, canActivate: [authGuard], data: { requiredPermission: 'publish_games' }, title: 'Panel de Desarrollador' },
  { path: 'perfil', component: ProfileComponent, canActivate: [authGuard], title: 'Mi Perfil - Indie Games' },
  { path: 'terminos-de-uso', component: TermsOfUse, title: 'Términos de Uso' }
];
