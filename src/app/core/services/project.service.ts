// core/services/project.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../models/model';
import { environment } from '../../../environments/environment';


// Types projet
export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'ON_HOLD' | 'CANCELLED';

export interface ProjectCreateDto {
  name: string;
  description?: string | null;
  status: ProjectStatus;
  organizationID: number;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  organizationID: number;
  createdAt: string; // ISO
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  // adapte si tu as un environnement
  private base = environment.API_BASE_URL;

  constructor() { }

  /** POST /project/creat (l'URL fournie a bien "creat") */
  create(dto: ProjectCreateDto) {
    return this.http.post<ApiResponse<Project>>(
      `${this.base}/project/creat`,
      dto
    );
  }

  /** GET /project/all?organizationId=... (à adapter si ton API diffère) */
  listByOrg(organizationId: number) {
    const params = new HttpParams().set('OrganizationId', organizationId);
    return this.http.get<ApiResponse<Project[]>>(
      `${this.base}/project/byIdUserAndOrganization`, { params }
    );
  }
}
