import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { rickMortyService } from '../../services/rickMorty.service';
import { AuthService, User } from '../../services/auth.service';
import { CommentsService, Comment } from '../../services/comments.service';

@Component({
  selector: 'app-episode-detail',
  templateUrl: './episode-detail.component.html',
  styleUrls: ['./episode-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule]
})
export class EpisodeDetailComponent implements OnInit {
  episode: any = null;
  characters: any[] = [];
  comments: Comment[] = [];
  currentUser: User | null = null;

  loading: boolean = true;
  error: string = '';

  // Comentarios
  commentForm!: FormGroup;
  editingCommentId: string | null = null;
  commentsDisabled: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private rickMortyService: rickMortyService,
    public authService: AuthService,
    private commentsService: CommentsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeCommentForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEpisode(+id);
    }
  }

  initializeCommentForm(): void {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  loadEpisode(id: number): void {
    this.loading = true;
    this.error = '';

    this.rickMortyService.getEpisodeById(id).subscribe({
      next: (episode) => {
        this.episode = episode;

        // Cargar comentarios
        this.loadComments(episode.id);

        // Cargar personajes del episodio
        if (episode.characters && episode.characters.length > 0) {
          this.loadCharacters(episode.characters);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading episode:', error);
        this.error = 'Error al cargar el episodio';
        this.loading = false;
      }
    });
  }

  private loadCharacters(characterUrls: string[]): void {
    this.rickMortyService.getMultipleCharacters(characterUrls).subscribe({
      next: (characters) => {
        this.characters = Array.isArray(characters) ? characters : [characters];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading characters:', error);
        this.characters = [];
        this.loading = false;
      }
    });
  }

  private loadComments(characterId: number): void {
    this.commentsService.getCommentsByCharacter(characterId).subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments;
      },
      error: (error: any) => {
        console.error('Error loading comments:', error);
      }
    });
  }

  isFavorite(): boolean {
    if (!this.episode) return false;
    return this.authService.isFavoriteEpisode(this.episode.id);
  }

  toggleFavorite(): void {
    if (!this.episode) return;

    this.authService.toggleFavoriteEpisode(this.episode.id).subscribe({
      next: () => {
        console.log('Favorito actualizado');
      },
      error: (error) => {
        console.error('Error al actualizar favorito:', error);
      }
    });
  }

  // Comentarios
  onSubmitComment(): void {
    if (this.commentForm.invalid || !this.currentUser || !this.episode) {
      return;
    }

    const content = this.commentForm.value.content;

    if (this.editingCommentId) {
      // Actualizar comentario existente
      this.commentsService.updateComment(this.editingCommentId, content).subscribe({
        next: () => {
          this.loadComments(this.episode.id);
          this.commentForm.reset();
          this.editingCommentId = null;
        },
        error: (error) => {
          alert(error.message || 'Error updating comment');
        }
      });
    } else {
      // Crear nuevo comentario
      this.commentsService.createComment(
        this.episode.id,
        String(this.currentUser.id),
        this.currentUser.name,
        this.currentUser.avatar || 'https://via.placeholder.com/150',
        content
      ).subscribe({
        next: () => {
          this.loadComments(this.episode.id);
          this.commentForm.reset();
        },
        error: (error) => {
          alert(error.message || 'Error creating comment');
        }
      });
    }
  }

  editComment(comment: Comment): void {
    this.editingCommentId = String(comment.id);
    this.commentForm.patchValue({
      content: comment.text
    });
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.commentForm.reset();
  }

  deleteComment(commentId: string): void {
    if (!this.currentUser || !confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    this.commentsService.deleteComment(commentId).subscribe({
      next: () => {
        this.loadComments(this.episode.id);
      },
      error: (error) => {
        alert(error.message || 'Error deleting comment');
      }
    });
  }

  toggleCommentsStatus(): void {
    if (!this.currentUser || !this.episode) return;
    // Toggle comments functionality - all data is in localStorage
  }

  canEditComment(comment: Comment): boolean {
    return String(this.currentUser?.id) === String(comment.userId);
  }

  canDeleteComment(comment: Comment): boolean {
    if (!this.currentUser) return false;
    return String(this.currentUser.id) === String(comment.userId) || this.currentUser.role === 'admin';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  getDefaultAvatar(): string {
    return 'https://via.placeholder.com/40/3a3a3a/ffffff?text=U';
  }
}
