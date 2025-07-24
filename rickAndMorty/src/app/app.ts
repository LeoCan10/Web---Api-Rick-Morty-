import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppRoutingModule } from './app.routes';
import { routes } from './app.routes';
import { bootstrapApplication } from '@angular/platform-browser';
import { NavbarComponent } from "./components/navbar/navbar.component";

bootstrapApplication(Component,{
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
})

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('rickAndMorty');
}
