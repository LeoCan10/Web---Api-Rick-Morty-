import { Component } from '@angular/core';
import { RouterLinkActive, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
export class NavbarComponent {
  constructor(
    private router: Router,
    private snack: MatSnackBar
  ) {}
}
