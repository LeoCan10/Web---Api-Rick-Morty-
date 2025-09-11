import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
      RouterLink,
      NgIf
],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isSubmitting = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const { email, password } = this.loginForm.value;
      const success = this.auth.login(email, password);

      if (success) {
        const user = this.auth.getCurrentUser();
        this.snack.open(`¡Bienvenido ${user?.name}! 👋`, 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/profile']);
      } else {
        this.snack.open('Credenciales incorrectas ❌', 'Cerrar', {
          duration: 3000,
        });
      }

      this.isSubmitting = false;
    }
  }
}
