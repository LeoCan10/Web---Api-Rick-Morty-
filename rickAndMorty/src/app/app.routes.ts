// ...existing code...
import { Routes } from '@angular/router';
import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { NotFoundComponent } from './pages/notfound/notfound.component';

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
    path: 'notfound',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: 'notfound',
  },
];
