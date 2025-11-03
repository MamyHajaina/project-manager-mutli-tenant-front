import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
    },
    {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./layouts/admin/admin').then(m => m.Admin),
        children: [
            { path: 'users', loadComponent: () => import('./features/admin/users/users').then(m => m.Users) },
            { path: 'users/:id', loadComponent: () => import('./features/admin/users/details/details').then(m => m.Details) },
            { path: '', pathMatch: 'full', redirectTo: 'users' }
        ]
    },
    {
        path: 'user',
        canActivate: [authGuard],
        loadComponent: () => import('./layouts/user/user').then(m => m.User),
        children: [
            { path: 'profil', loadComponent: () => import('./features/user/profil/profil').then(m => m.Profil) },
            { path: 'project', loadComponent: () => import('./features/user/project/project').then(m => m.ProjectComponent) },
            { path: '', pathMatch: 'full', redirectTo: 'profil' }
        ]
    },
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: '**', redirectTo: 'login' },
];