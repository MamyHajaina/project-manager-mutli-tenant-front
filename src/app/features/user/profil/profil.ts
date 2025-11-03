import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { UserModel } from '../../../core/models/model';

@Component({
  selector: 'app-profil',
  imports: [],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {
  private userService = inject(UserService);
  private currentUser = { id: 1 };

  user = signal<UserModel | null>(null);

  constructor() {
    this.load();
  }

  load() {
    this.userService.getByIdUser(this.currentUser.id).subscribe({
      next: (response) => {
        this.user.set(response.data);
        console.log('1)User data:', this.user, response.data);
        console.log('2)User data:', response.data);
      },
      error: (err) => {
        console.error('Error loading user data:', err);
      },
    });
  }


}
