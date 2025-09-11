import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { MatCardModule, MatCard } from '@angular/material/card';
import { MatFormFieldModule, MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInputModule, MatInput } from '@angular/material/input';
import { MatButtonModule, MatIconButton, MatButton } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PasswordStrengthDirective } from "../../shared/password-strength";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    NgIf,
    PasswordStrengthDirective,
    RouterModule,
      MatError,
      MatFormField,
      MatLabel,
      MatInput,
      MatCard,
      MatSuffix,
      MatIconButton,
      MatButton
],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  hidePassword = true;
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
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
  if (this.registerForm.valid && !this.isSubmitting) {
    this.isSubmitting = true;

    const success = this.auth.register(this.registerForm.value);

    if (success) {
      this.snack.open('Usuario registrado con éxito ✅', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      setTimeout(() => {
        this.registerForm.reset();
        this.router.navigate(['/login']);
        this.isSubmitting = false;
      }, 2000);

    } else {
      this.snack.open('El email ya está registrado ❌', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.isSubmitting = false;
    }
  }
}


  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
