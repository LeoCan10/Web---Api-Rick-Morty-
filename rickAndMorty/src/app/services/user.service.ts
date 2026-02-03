import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USERS_KEY = 'rickmorty_users';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
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

  getUsers(): Observable<User[]> {
    return new Observable(subscriber => {
      try {
        const users = this.getStoredUsers();
        subscriber.next(users);
        subscriber.complete();
      } catch (err) {
        console.error('Error fetching users', err);
        subscriber.next([]);
        subscriber.complete();
      }
    });
  }

  createUser(user: User): Observable<User> {
    return new Observable(subscriber => {
      try {
        const users = this.getStoredUsers();

        const newUser: User = {
          id: Date.now().toString(),
          nombre: user.nombre,
          email: user.email,
          avatar: user.avatar || 'https://via.placeholder.com/150'
        };

        users.push(newUser);
        this.saveUsers(users);

        subscriber.next(newUser);
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    });
  }

  getUserById(id: string): Observable<User | null> {
    return new Observable(subscriber => {
      try {
        const users = this.getStoredUsers();
        const user = users.find(u => u.id === id) || null;
        subscriber.next(user);
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    });
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return new Observable(subscriber => {
      try {
        const users = this.getStoredUsers();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
          subscriber.error(new Error('Usuario no encontrado'));
          return;
        }

        users[index] = { ...users[index], ...userData };
        this.saveUsers(users);

        subscriber.next(users[index]);
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    });
  }

  deleteUser(id: string): Observable<boolean> {
    return new Observable(subscriber => {
      try {
        const users = this.getStoredUsers();
        const filtered = users.filter(u => u.id !== id);

        if (filtered.length === users.length) {
          subscriber.error(new Error('Usuario no encontrado'));
          return;
        }

        this.saveUsers(filtered);
        subscriber.next(true);
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    });
  }
}
