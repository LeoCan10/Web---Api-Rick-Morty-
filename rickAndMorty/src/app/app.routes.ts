// ...existing code...
import { Routes } from '@angular/router';
import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { NotFoundComponent } from './pages/notfound/notfound.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  {
    path: 'characters',
    component: CharactersComponent,
    pathMatch: 'full',
  },
  {
    path: 'characters/:id',
    component: CharacterDetailComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'characters',
  },
  {
    path: '**',
    redirectTo: 'notfound',
  },
    {
    path: 'notfound',
    component: NotFoundComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
];
