import { Component, effect, signal } from '@angular/core';
import { NgClass, NgOptimizedImage } from "@angular/common";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-user',
  imports: [
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  sidebarOpen = signal(false);
  toggle() { this.sidebarOpen.update(v => !v); }
  constructor(private auth: AuthService) {
    effect(() => {
      const on = this.sidebarOpen();
      document.body.classList.toggle('toggle-sidebar', on);
    });
  }
  logout() { this.auth.logout(); location.href = '/login'; }
}
