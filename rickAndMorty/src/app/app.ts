import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppRoutingModule } from './app.routes';
import { routes } from './app.routes';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(Component,{
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
})

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('rickAndMorty');
}
