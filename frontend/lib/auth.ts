// Authentication utility functions

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function setUserData(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUserData(): User | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export function logout(): void {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}



