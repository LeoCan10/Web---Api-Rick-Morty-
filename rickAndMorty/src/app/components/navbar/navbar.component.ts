// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterLinkActive, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [
    CommonModule,
    RouterLinkActive,
    RouterLink
  ]
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  userName: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = user !== null;
      this.userName = user?.name || '';
    });

    // También verificar el estado inicial
    this.isLoggedIn = this.authService.isLoggedIn();
    const currentUser = this.authService.getCurrentUser();
    this.userName = currentUser?.name || '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
