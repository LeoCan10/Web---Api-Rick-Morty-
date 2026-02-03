// auth.service.ts - Almacenamiento completo en localStorage
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number | string;
  name: string;
  email: string;
  password?: string;
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly CURRENT_USER_KEY = 'rickmorty_current_user';
  private readonly USERS_KEY = 'rickmorty_users';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.restoreFromLocalSync();
    this.initializeUsers();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private initializeUsers(): void {
    if (!this.isBrowser()) return;
    if (!localStorage.getItem(this.USERS_KEY)) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
    }
  }

  private getStoredUsers(): User[] {
    if (!this.isBrowser()) return [];
    const stored = localStorage.getItem(this.USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveUsers(users: User[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  // Synchronous restore used by guards to avoid async redirect
  restoreFromLocalSync(): boolean {
    if (!this.isBrowser()) return false;
    const stored = localStorage.getItem(this.CURRENT_USER_KEY);
    if (!stored) return false;
    try {
      const user = JSON.parse(stored);
      this.currentUserSubject.next(user);
      return true;
    } catch {
      return false;
    }
  }

  register(userData: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return new Observable(subscriber => {
      if (!this.isBrowser()) {
        subscriber.error({ success: false, message: 'Browser storage not available' });
        return;
      }

      const users = this.getStoredUsers();

      // Verificar si el email ya existe
      if (users.some(u => u.email === userData.email)) {
        subscriber.error({ success: false, message: 'El email ya está registrado' });
        return;
      }

      // Crear nuevo usuario
      const newUser: User = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        avatar: 'https://via.placeholder.com/150',
        favoriteEpisodes: []
      };

      users.push(newUser);
      this.saveUsers(users);

      const { password, ...userWithoutPassword } = newUser;
      subscriber.next({ success: true, message: 'Registro exitoso', user: userWithoutPassword });
      subscriber.complete();
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return new Observable(subscriber => {
      if (!this.isBrowser()) {
        subscriber.error({ success: false, message: 'Browser storage not available' });
        return;
      }

      const users = this.getStoredUsers();
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        subscriber.error({ success: false, message: 'Email o contraseña inválidos' });
        return;
      }

      const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('authToken', token);

      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      this.currentUserSubject.next(userWithoutPassword as User);

      subscriber.next({
        success: true,
        message: 'Login exitoso',
        user: userWithoutPassword as User,
        token
      });
      subscriber.complete();
    });
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.CURRENT_USER_KEY);
      localStorage.removeItem('authToken');
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
    if (!this.isBrowser()) return null;
    return localStorage.getItem('authToken');
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return new Observable(subscriber => {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        subscriber.error(new Error('Usuario no autenticado'));
        return;
      }

      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex === -1) {
        subscriber.error(new Error('Usuario no encontrado'));
        return;
      }

      // Actualizar usuario
      users[userIndex] = { ...users[userIndex], ...userData };
      this.saveUsers(users);

      const { password, ...updatedUser } = users[userIndex];
      if (this.isBrowser()) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }
      this.currentUserSubject.next(updatedUser as User);
      subscriber.next(updatedUser as User);
      subscriber.complete();
    });
  }

  toggleFavoriteEpisode(episodeId: number): Observable<User> {
    return new Observable(subscriber => {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        subscriber.error(new Error('Usuario no autenticado'));
        return;
      }

      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex === -1) {
        subscriber.error(new Error('Usuario no encontrado'));
        return;
      }

      // Toggle favorito
      const favorites = users[userIndex].favoriteEpisodes || [];
      const idx = favorites.indexOf(episodeId);
      if (idx > -1) {
        favorites.splice(idx, 1);
      } else {
        favorites.push(episodeId);
      }

      users[userIndex].favoriteEpisodes = favorites;
      this.saveUsers(users);

      const { password, ...updatedUser } = users[userIndex];
      if (this.isBrowser()) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }
      this.currentUserSubject.next(updatedUser as User);
      subscriber.next(updatedUser as User);
      subscriber.complete();
    });
  }

  isFavoriteEpisode(episodeId: number): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    return (currentUser.favoriteEpisodes || []).includes(episodeId);
  }
}
