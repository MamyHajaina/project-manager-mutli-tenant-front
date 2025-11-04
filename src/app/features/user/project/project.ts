import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService, ProjectCreateDto, ProjectStatus } from '../../../core/services/project.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { Org, OrganizationService } from '../../../core/services/organisation.service';

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

  // UI state (signals)
  loading = signal(false);
  error = signal<string | null>(null);

  // Données (tableaux simples)
  projects: any[] = [];
  organizationsByUser: Org[] = [];

  // Filtres (signals)
  token = signal<string>('');
  orgId = signal<number>(0); // 0 = "Toutes"

  // Formulaire création
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: ['PLANNED' as ProjectStatus, Validators.required],
    organizationID: [0, Validators.required],
  });

  constructor() {
    // Synchroniser token & org depuis AuthStore
    effect(() => {
      const session = this.auth.session(); // supposé être un signal côté store
      const userId = session?.user?.id;

      if (session?.token) this.token.set(session.token);

      // On ne tire l’API qu’avec un userId valide
      if (typeof userId === 'number' && userId > 0) {
        this.getOrgByUserId(userId);
      }
    });
  }

  ngOnInit(): void {
    // par défaut → toutes orgs = 0
    this.orgId.set(0);
    this.getListByOrg(this.orgId());
  }

  /** TrackBy utilitaire */
  trackById = (_: number, o: { id: number }) => o.id;

  /** Charger projets par orgId (0 = toutes) */
  getListByOrg(orgId: number) {
    this.loading.set(true);
    this.error.set(null);

    this.svc.listByOrg(orgId).subscribe({
      next: (res) => {
        this.projects = res?.data ?? [];
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Impossible de charger les projets');
        this.loading.set(false);
      }
    });
  }

  /** Soumission création projet */
  submit() {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const dto: ProjectCreateDto = this.form.getRawValue();

    this.svc.create(dto).subscribe({
      next: () => {
        // Reset partiel (on garde org & status)
        this.form.patchValue({ name: '', description: '' });
        this.loading.set(false);
        // Recharger la liste
        this.getListByOrg(this.orgId());
      },
      error: (err) => {
        console.error(err);
        this.error.set('Création du projet échouée');
        this.loading.set(false);
      }
    });
  }

  /** Badge CSS par status */
  statusBadge(s: ProjectStatus): string {
    switch (s) {
      case 'PLANNED': return 'badge text-bg-secondary';
      case 'IN_PROGRESS': return 'badge text-bg-primary';
      case 'DONE': return 'badge text-bg-success';
      case 'CANCELLED': return 'badge text-bg-danger';
      default: return 'badge text-bg-secondary';
    }
  }

  /** Changement d’org pour filtrer la liste */
  onOrgChange(id: number) {
    this.orgId.set(id);
    this.getListByOrg(id);
  }

  /** Bouton "Rafraîchir" */
  fetch() {
    this.getListByOrg(this.orgId());
  }

  /** Charger orgs de l’utilisateur + initialiser le formulaire */
  getOrgByUserId(userId: number) {
    this.orgsvc.getOrgByUserId(userId).subscribe({
      next: (res: any) => {
        this.organizationsByUser = res?.data ?? [];

        // Si aucune org → désactiver la création (org obligatoire)
        if (!this.organizationsByUser.length) {
          this.form.patchValue({ organizationID: 0 });
          return;
        }

        // Si l’org du formulaire est 0, auto-sélectionner la 1ère
        const currentOrgId = this.form.controls.organizationID.value;
        if (!currentOrgId || currentOrgId === 0) {
          const firstId = this.organizationsByUser[0].id;
          this.form.patchValue({ organizationID: firstId });
        }
      },
      error: (err: any) => {
        console.error(err);
        this.error.set('Impossible de charger vos organisations');
      }
    });
  }
}
