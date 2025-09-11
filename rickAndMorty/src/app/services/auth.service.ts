import { Injectable } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersKey = 'auth_users';
  private sessionKey = 'auth_session';

  constructor() {
    // Inicializar storage si no existe
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify([]));
    }
  }

  // Obtener todos los usuarios
  private getAllUsers(): User[] {
    const data = localStorage.getItem(this.usersKey);
    return data ? JSON.parse(data) : [];
  }

  // Guardar usuarios
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Registrar usuario
  register(userData: Omit<User, 'id' | 'createdAt'>): boolean {
    const users = this.getAllUsers();

    // Verificar si el email ya existe
    if (users.find(user => user.email === userData.email)) {
      return false; // Usuario ya existe
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: this.generateId(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: new Date()
    };

    users.push(newUser);
    this.saveUsers(users);
    return true;
  }

  // Login
  login(email: string, password: string): boolean {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Crear sesión
      localStorage.setItem(this.sessionKey, JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        loginAt: new Date()
      }));
      return true;
    }
    return false;
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    const sessionData = localStorage.getItem(this.sessionKey);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    const users = this.getAllUsers();
    return users.find(u => u.id === session.id) || null;
  }

  // Verificar autenticación
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Actualizar usuario
  updateUser(updatedUser: User): boolean {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);

    if (index === -1) return false;

    // Verificar que el email no esté en uso por otro usuario
    const emailExists = users.find(u => u.email === updatedUser.email && u.id !== updatedUser.id);
    if (emailExists) return false;

    users[index] = updatedUser;
    this.saveUsers(users);

    // Actualizar sesión si es el usuario actual
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      localStorage.setItem(this.sessionKey, JSON.stringify({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        loginAt: JSON.parse(localStorage.getItem(this.sessionKey)!).loginAt
      }));
    }

    return true;
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }
}
