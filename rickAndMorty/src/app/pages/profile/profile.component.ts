import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { rickMortyService } from '../../services/rickMorty.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  favoriteEpisodes: any[] = [];
  isEditing: boolean = false;
  editForm!: FormGroup;
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private rickMortyService: rickMortyService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();

    if (this.user) {
      this.loadFavoriteEpisodes();
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (!this.user) return;

    // Obtenemos el nickname, o el name si no existe nickname
    const displayName = this.user.name;
    const userAvatar = this.user.avatar ?? '';
    const userLocation = this.user.location ?? '';

    this.editForm = this.fb.group({
      nickname: [displayName, Validators.required],
      avatar: [userAvatar],
      location: [userLocation]
    });
  }

  loadFavoriteEpisodes(): void {
    if (!this.user || !this.user.favoriteEpisodes || this.user.favoriteEpisodes.length === 0) {
      this.favoriteEpisodes = [];
      return;
    }

    // Cargar detalles de episodios favoritos
    const episodeIds = this.user.favoriteEpisodes.join(',');
    this.rickMortyService.getMultipleEpisodes(
      this.user.favoriteEpisodes.map(id => `https://rickandmortyapi.com/api/episode/${id}`)
    ).subscribe({
      next: (episodes) => {
        this.favoriteEpisodes = Array.isArray(episodes) ? episodes : [episodes];
      },
      error: (error) => {
        console.error('Error loading favorite episodes:', error);
        this.favoriteEpisodes = [];
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isEditing) {
      this.initializeForm();
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.editForm.value;

    this.authService.updateProfile(formData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing = false;
        this.loading = false;
        this.successMessage = 'Profile updated successfully!';

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error updating profile. Please try again.';
        console.error('Error updating profile:', error);
      }
    });
  }

  removeFavorite(episodeId: number): void {
    this.authService.toggleFavoriteEpisode(episodeId).subscribe({
      next: () => {
        this.user = this.authService.getCurrentUser();
        this.loadFavoriteEpisodes();
      },
      error: (error) => {
        console.error('Error removing favorite:', error);
      }
    });
  }

  getDefaultAvatar(): string {
    return 'https://via.placeholder.com/150/3a3a3a/ffffff?text=No+Photo';
  }

  // Getter para mostrar el nombre en la vista
  get displayName(): string {
    if (!this.user) return '';
    return this.user.name;
  }
}
