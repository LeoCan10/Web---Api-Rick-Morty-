// src/app/app.routes.ts
import { RouterModule, Routes } from '@angular/router';
import { NgModule} from '@angular/core';

import { CharactersComponent } from './pages/characters/characters.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';
import { notFoundComponent } from './pages/notfound/notfound.component';

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
    component: notFoundComponent,
  },
  {
    path: '**',
    redirectTo: 'notfound',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
