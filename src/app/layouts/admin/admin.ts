import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterOutlet, RouterLink, NgOptimizedImage],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Admin {
  sidebarOpen = signal(true);
  toggle() { this.sidebarOpen.update(v => !v); }
  constructor(private store: AuthStore) {
    effect(() => {
      const on = this.sidebarOpen();
      document.body.classList.toggle('toggle-sidebar', on);
    });
  }
  logout() { this.store.logout(); location.href = '/login'; }
}
