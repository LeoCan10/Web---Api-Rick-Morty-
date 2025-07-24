import { RouterModule, Routes } from '@angular/router';
import { NgModule} from '@angular/core';
import { CharactersComponent } from './pages/characters/characters.component';


export const routes: Routes = [
  {
    path: 'characters',
    component: CharactersComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'characters',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
