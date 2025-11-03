// features/user/project/project.ts
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService, Project, ProjectCreateDto, ProjectStatus } from '../../../core/services/project.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { OrganizationService } from '../../../core/services/organisation.service';

@Component({
  selector: 'app-project',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block' }
})
export class ProjectComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProjectService);
  private auth = inject(AuthStore);
  private orgsvc = inject(OrganizationService);

  ngOnInit(): void {
    this.orgId.set(0);
    this.getListByOg(this.orgId());
  }


  // UI state
  loading = signal(false);
  error = signal<string | null>(null);
  projects: any = [];
  organizations: any = [];

  // récup token + 1ère org de l'utilisateur (adapte selon la forme de ta session)
  token = signal<string>('');
  orgId = signal<number>(0);

  // Formulaire création
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: ['PLANNED' as ProjectStatus, Validators.required],
    organizationID: [0, Validators.required],
  });

  constructor() {
    // synchroniser token & org depuis AuthStore
    effect(() => {
      const session = this.auth.session(); // ex: { token, user: { organization: [...] } }
      this.orgsvc.getOrgByUserId(session?.user?.id).subscribe((res: any) => {
        this.organizations = res.data;
        console.log(this.organizations);
      })
      if (session?.token) this.token.set(session.token);
    });
  }

  getListByOg(orgId: number) {
    console.log("~~~", orgId);


    this.loading.set(true);
    this.error.set(null);

    this.svc.listByOrg(orgId).subscribe({
      next: (res) => {
        this.projects = res.data ?? [];
        console.log("projects", res);

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Impossible de charger les projets');
        this.loading.set(false);
        console.error(err);
      }
    });

  }

  submit() {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    const dto: ProjectCreateDto = this.form.getRawValue();

    this.svc.create(dto).subscribe({
      next: (res) => {
        // reset léger (on laisse organizationID et status)
        this.form.patchValue({ name: '', description: '' });
        this.loading.set(false);
        this.getListByOg(this.orgId());
      },
      error: (err) => {
        this.error.set('Création du projet échouée');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  statusBadge(s: ProjectStatus): string {
    switch (s) {
      case 'PLANNED': return 'badge text-bg-secondary';
      case 'IN_PROGRESS': return 'badge text-bg-primary';
      case 'DONE': return 'badge text-bg-success';
      case 'CANCELLED': return 'badge text-bg-danger';
      default: return 'badge text-bg-secondary';
    }
  }

  onOrgChange(id: number) {
    this.orgId.set(id);
    this.getListByOg(this.orgId());
  }

  fetch() {
    this.getListByOg(this.orgId());
  }
}
