// src/app/app.routes.ts
import { RouterModule, Routes } from '@angular/router';
import { NgModule} from '@angular/core';

import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { NotFoundComponent } from './pages/notfound/notfound.component';
import { RenderMode } from '@angular/ssr';
import { guestGuard } from './services/guest.guard';
import { authGuard } from './services/auth.guard';

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
    redirectTo: 'login',
  },
  {
    path: 'notfound',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: 'notfound',
  },
  { path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  { path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  { path: 'profile',
    loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
];
