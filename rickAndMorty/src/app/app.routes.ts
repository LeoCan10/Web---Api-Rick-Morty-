// app.routes.ts
import { Routes } from '@angular/router';
import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { NotFoundComponent } from './pages/notfound/notfound.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard, LoginGuard } from './services/auth.guard';
import { EpisodesComponent } from './pages/episodes/episodes.component';
import { EpisodeDetailComponent } from './pages/episode-detail/episode-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  {
    path: 'characters',
    component: CharactersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'characters/:id',
    component: CharacterDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'episodes',
    component: EpisodesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'episodes/:id',
    component: EpisodeDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'characters',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'notfound',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: 'notfound',
  },
];
