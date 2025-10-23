// auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { delay, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  birthdate?: string;
  location?: string;
  role?: 'user' | 'admin';
  favoriteEpisodes?: number[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly USERS_KEY = 'rickmorty_users';
  private readonly CURRENT_USER_KEY = 'rickmorty_current_user';

  // Inyectamos PLATFORM_ID para verificar si estamos en el navegador
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.checkStoredUser();
  }

  // Metodo para verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private checkStoredUser(): void {
    // Solo acceder a localStorage si estamos en el navegador
    if (this.isBrowser()) {
      const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          this.logout();
        }
      }
    }
  }

  private getUsers(): User[] {
    if (!this.isBrowser()) {
      return [];
    }

    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: User[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  register(userData: Omit<User, 'id'>): Observable<AuthResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const users = this.getUsers();

        // Verifica si el email ya existe
        const existingUser = users.find(user => user.email === userData.email);
        if (existingUser) {
          throw {
            success: false,
            message: 'El email ya está registrado'
          };
        }

        // Valida que las contraseñas coincidan (si se pasa confirmPassword)
        if ((userData as any).confirmPassword && userData.password !== (userData as any).confirmPassword) {
          throw {
            success: false,
            message: 'Las contraseñas no coinciden'
          };
        }

        // Crea nuevo usuario
        const newUser: User = {
          ...userData,
          id: Date.now(),
          avatar: `https://rickandmortyapi.com/api/character/avatar/${Math.floor(Math.random() * 100) + 1}.jpeg`
        };

        // Guardar usuario
        users.push(newUser);
        this.saveUsers(users);

        return {
          success: true,
          message: 'Usuario registrado exitosamente',
          user: newUser
        };
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
          throw {
            success: false,
            message: 'Credenciales incorrectas'
          };
        }

        // Guarda el usuario en localStorage solo si estamos en el navegador
        if (this.isBrowser()) {
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        }

        this.currentUserSubject.next(user);

        return {
          success: true,
          message: 'Login exitoso',
          user: user,
          token: 'mock-jwt-token-' + Date.now()
        };
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getAuthToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem('authToken');
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return of(null).pipe(
      delay(500),
      map(() => {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
          throw new Error('Usuario no encontrado');
        }

        const updatedUser = { ...users[userIndex], ...userData };
        users[userIndex] = updatedUser;
        this.saveUsers(users);

        // Actualizar usuario actual
        if (this.isBrowser()) {
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
        }

        this.currentUserSubject.next(updatedUser);

        return updatedUser;
      })
    );
  }

  toggleFavoriteEpisode(episodeId: number): Observable<User> {
  const currentUser = this.getCurrentUser();
  if (!currentUser) {
    return throwError(() => new Error('Usuario no autenticado'));
  }

  const favoriteEpisodes = currentUser.favoriteEpisodes || [];
  const index = favoriteEpisodes.indexOf(episodeId);

  let updatedFavorites: number[];
  if (index === -1) {
    // ➕ Agregar si no estaba
    updatedFavorites = [...favoriteEpisodes, episodeId];
  } else {
    // ➖ Quitar si ya estaba
    updatedFavorites = favoriteEpisodes.filter(id => id !== episodeId);
  }

  return this.updateProfile({ favoriteEpisodes: updatedFavorites });
}


  isFavoriteEpisode(episodeId: number): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    return (currentUser.favoriteEpisodes || []).includes(episodeId);
  }
}
