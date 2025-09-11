import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule, MatIconButton, MatButton } from '@angular/material/button';
import { MatFormFieldModule, MatFormField, MatError, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInputModule, MatInput } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule, MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { PasswordStrengthDirective } from "../../shared/password-strength";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    NgIf,
    PasswordStrengthDirective,
      MatCard,
      MatFormField,
      MatError,
      MatLabel,
      MatInput,
      MatIconButton,
      MatSuffix,
      MatButton
],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  profileForm!: FormGroup;
  hidePassword = true;
  isSubmitting = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    console.log("Perfil Inicializado");
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    console.log("Perfil Destruido");
  }

  private loadUserData(): void {
    this.user = this.auth.getCurrentUser();

    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeForm();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: [this.user?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      password: [this.user?.password || '', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSave(): void {
    if (this.profileForm.valid && !this.isSubmitting && this.user) {
      this.isSubmitting = true;

      const updatedUser: User = {
        ...this.user,
        name: this.profileForm.value.name,
        email: this.profileForm.value.email,
        password: this.profileForm.value.password
      };

      const success = this.auth.updateUser(updatedUser);

      if (success) {
        this.user = updatedUser;
        this.snack.open('Perfil actualizado correctamente ✅', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else {
        this.snack.open('Error: El email ya está en uso por otro usuario ❌', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }

      this.isSubmitting = false;
    }
  }

  onReset(): void {
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        password: this.user.password
      });
      this.snack.open('Formulario restaurado 🔄', 'Cerrar', { duration: 2000 });
    }
  }

  logout(): void {
    this.auth.logout();
    this.snack.open('Sesión cerrada correctamente 👋', 'Cerrar', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
    this.router.navigate(['/login']);
  }
}
