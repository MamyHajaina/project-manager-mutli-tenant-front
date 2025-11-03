import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';            // ← pour ngModel
import { UserService } from './user.service';
import { AppUserList } from './user.types';
import {RouterLink} from '@angular/router';

type RoleFilter = 'ALL' | 'ADMIN' | 'CLIENT' | 'MEMBER' | 'PROJECT_MANAGER';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users {
  private api = inject(UserService);

  loading = signal(true);
  error = signal<string | null>(null);
  users = signal<AppUserList>([]);

  // UI state
  q = signal('');                               // recherche
  role = signal<RoleFilter>('ALL');             // filtre rôle
  sortBy = signal<keyof (AppUserList[number])>('fullName');
  sortDir = signal<'asc' | 'desc'>('asc');

  readonly roles = ['ALL','ADMIN','CLIENT','MEMBER','PROJECT_MANAGER'] as const;

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAll().subscribe({
      next: list => { this.users.set(list); this.loading.set(false); },
      error: err => { this.error.set(err?.message ?? 'Unable to load users'); this.loading.set(false); },
    });
  }

  // computed list
  view = computed(() => {
    const q = this.q().trim().toLowerCase();
    const role = this.role();
    const dir = this.sortDir();
    const by = this.sortBy();

    const base = this.users();
    let out = base;

    if (q) {
      out = out.filter(u =>
        (u.fullName ?? '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (role !== 'ALL') {
      out = out.filter(u => u.role === role);
    }

    out = [...out].sort((a: any, b: any) => {
      const va = (a?.[by] ?? '').toString().toLowerCase();
      const vb = (b?.[by] ?? '').toString().toLowerCase();
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    return out;
  });

  toggleSort(col: keyof (AppUserList[number])) {
    if (this.sortBy() === col) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(col);
      this.sortDir.set('asc');
    }
  }

  roleBadge(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-primary';
      case 'CLIENT': return 'bg-success';
      case 'MEMBER': return 'bg-secondary';
      case 'PROJECT_MANAGER': return 'bg-info';
      default: return 'bg-dark';
    }
  }

  trackRow = (_: number, u: AppUserList[number]) => u.id;
}
