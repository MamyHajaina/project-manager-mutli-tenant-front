import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block' }
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authStore = inject(AuthStore);

  // État UI
  submitting = signal(false);
  error = signal<string | null>(null);

  // Formulaire réactif
  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    remember: [false],
  });

  invalid(ctrl: 'email' | 'password') {
    const c = this.form.controls[ctrl];
    return c.invalid && (c.dirty || c.touched);
  }

  async submit() {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);

    const { email, password, remember } = this.form.getRawValue();

    try {
      const res = await this.authStore.login({ email, password }, remember);
      this.authStore.persistNow();

      console.log('Persisted to:', remember ? 'localStorage' : 'sessionStorage');
      console.log('window.sessionStorage.keys =', Object.keys(window.sessionStorage));
      console.log('window.localStorage.keys =', Object.keys(window.localStorage));
      const msg = this.authStore.lastServerMessage();
      if (msg) {
        console.info('Server says:', msg);
      }

      const roles = res.user.roles || [];
      if (roles.includes('ADMIN')) {
        await this.router.navigateByUrl('/admin');
      } else {
        await this.router.navigateByUrl('/user');
      }
    } catch {
      this.error.set(this.authStore.error() ?? 'Invalid credentials.');
    } finally {
      this.submitting.set(false);
    }
  }

}

//Client	alice.client@acme.com	2025Test!?
//Admin	super.admin@system.local	2025Test!?
