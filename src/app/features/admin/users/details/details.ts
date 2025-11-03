import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiMembershipResponse, AppUserDetails } from '../user.types';
import { UserService } from '../user.service';
import { mapApiToAppUserDetails } from '../user.mapper';
import { Org, OrganizationService } from '../../../../core/services/organisation.service';
import { finalize, switchMap, tap } from 'rxjs';
import { ApiResponse, UserModel } from '../../../../core/models/model';

@Component({
  selector: 'app-details',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './details.html',
  styleUrl: './details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Details {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(UserService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<AppUserDetails | null>(null);
  userData = signal<UserModel>({} as UserModel);
  userId = signal<number>(0);

  private orgSrv = inject(OrganizationService);
  allOrgs = signal<Org[]>([]);
  assignSubmitting = signal(false);
  assignError = signal<string | null>(null);
  assignSuccess = signal<string | null>(null);
  selectedOrgId = signal<number | null>(null);
  isEditing = false;
  organizationsByUser = signal<Org[]>([]);


  // Affichage uniquement
  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(60)]],
    lastName: ['', [Validators.required, Validators.maxLength(60)]],
    email: [{ value: '', disabled: true }],
    role: [{ value: '', disabled: true }],
    createdAt: [{ value: '', disabled: true }],
  });

  ngOnInit() {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    console.log("Id", userId);
    this.userId.set(userId);
    this.getUserById(this.userId());

    if (!userId) { this.router.navigateByUrl('/admin/users'); return; }
    this.fetch();
    this.form.disable({ emitEvent: false });
  }

  private fetch() {
    this.fetchAllOrgs();
    this.loading.set(true);

    console.log("userId", this.userId());

    // ⬅️ Si ton service renvoie le JSON brut (ApiMembershipResponse)
    this.getOrgByUser(this.userId());
    this.loading.set(false);
  }

  getOrgByUser(userId: number) {
    this.api.getOrgByUser(userId).subscribe({
      next: (res: ApiResponse<Org[]>) => {
        this.organizationsByUser.set(res.data);
        console.log("~~~~organizationsByUser~~~~~!", this.organizationsByUser().length);
        this.loading.set(false);
      },
      error: e => { this.error.set(e?.message ?? 'Failed to load'); this.loading.set(false); }
    });
  }

  roleBadge(role: string) {
    switch (role) {
      case 'ADMIN': return 'bg-primary';
      case 'CLIENT': return 'bg-success';
      case 'MEMBER': return 'bg-secondary';
      case 'PROJECT_MANAGER': return 'bg-info';
      default: return 'bg-dark';
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const payload = this.form.value;
    // appeler ton service pour update
  }

  unassignedOrgs = computed(() => {
    const d = this.data();
    const current = d?.organizations ?? [];
    const all = this.allOrgs();
    const currentIds = new Set(current.map(o => o.id));
    return all.filter(o => !currentIds.has(o.id));
  });

  private fetchAllOrgs() {
    this.orgSrv.getAll().subscribe({
      next: res => this.allOrgs.set(res.data ?? []),
      error: () => this.allOrgs.set([])
    });
  }

  assignOrganization(userData: UserModel, orgId: number) {
    this.assignError.set(null);
    this.assignSuccess.set(null);

    if (!userData?.id || !orgId) {
      this.assignError.set('Sélection invalide.');
      return;
    }

    this.assignSubmitting.set(true);
    this.assignMember(orgId, userData.id);
  }

  assignMember(orgId: number, userId: number) {
    this.orgSrv.assignMember(orgId, userId)
      .pipe(
        finalize(() => this.assignSubmitting.set(false)),
        // Après succès, on recharge le user (pour refléter la nouvelle org dans la liste)
        tap(() => {
          this.assignSuccess.set('Organisation assignée avec succès.');
          const id = Number(this.route.snapshot.paramMap.get('id'));
          this.fetch();
        }),
        switchMap(() => {
          return 'of(null)';
        })
      )
      .subscribe({
        next: () => {
          // reset du select
          this.selectedOrgId.set(null);
          // On peut aussi rafraîchir la liste complète (utile si backend modifie des champs)
          this.fetchAllOrgs();
        },
        error: (e) => {
          this.assignError.set('Échec de l’assignation. Réessaie.');
        }
      });
  }

  getUserById(userId: number) {
    this.api.getUserById(userId).subscribe({
      next: (res: ApiResponse<UserModel>) => {
        this.userData.set(res.data);
        console.log("this.userData", this.userData());

        this.loading.set(false);
      },
      error: e => { this.error.set(e?.message ?? 'Failed to load'); this.loading.set(false); }
    });
  }

  submitAssignedOrg() {
    this.assignOrganization(this.userData(), this.selectedOrgId()!);
  }
}
