import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  /**
   * Set item in localStorage
   */
  set(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all localStorage
   */
  clear(): void {
    localStorage.clear();
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Set item in sessionStorage
   */
  setSession(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }

  /**
   * Get item from sessionStorage
   */
  getSession<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  }
}