import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    // Use a signal so components can reactively bind to it
    isDarkTheme = signal<boolean>(false);

    constructor() {
        // Read from localStorage on init
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDarkTheme.set(true);
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Optional: Fallback to system preference if no previously saved theme exists
            this.isDarkTheme.set(true);
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        }

        // Effect hook to automatically sync theme state with the DOM & LocalStorage
        effect(() => {
            if (this.isDarkTheme()) {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-bs-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    toggleTheme(): void {
        this.isDarkTheme.update(val => !val);
    }
}
