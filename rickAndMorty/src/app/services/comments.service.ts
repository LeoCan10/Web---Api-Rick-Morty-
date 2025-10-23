import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface Comment {
  id: number;
  episodeId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EpisodeCommentsConfig {
  episodeId: number;
  commentsDisabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private readonly COMMENTS_KEY = 'rickmorty_comments';
  private readonly COMMENTS_CONFIG_KEY = 'rickmorty_comments_config';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getAllComments(): Comment[] {
    if (!this.isBrowser()) return [];

    const commentsJson = localStorage.getItem(this.COMMENTS_KEY);
    return commentsJson ? JSON.parse(commentsJson) : [];
  }

  private saveComments(comments: Comment[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
    }
  }

  private getCommentsConfig(): EpisodeCommentsConfig[] {
    if (!this.isBrowser()) return [];

    const configJson = localStorage.getItem(this.COMMENTS_CONFIG_KEY);
    return configJson ? JSON.parse(configJson) : [];
  }

  private saveCommentsConfig(config: EpisodeCommentsConfig[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.COMMENTS_CONFIG_KEY, JSON.stringify(config));
    }
  }

  // Obtener comentarios de un episodio
  getCommentsByEpisode(episodeId: number): Observable<Comment[]> {
    return of(null).pipe(
      delay(300),
      map(() => {
        const allComments = this.getAllComments();
        return allComments.filter(comment => comment.episodeId === episodeId);
      })
    );
  }

  // Crear comentario
  createComment(
    episodeId: number,
    userId: number,
    userName: string,
    userAvatar: string,
    content: string
  ): Observable<Comment> {
    return of(null).pipe(
      delay(500),
      map(() => {
        // Verificar si los comentarios están deshabilitados
        if (this.areCommentsDisabled(episodeId)) {
          throw new Error('Comments are disabled for this episode');
        }

        const comments = this.getAllComments();

        const newComment: Comment = {
          id: Date.now(),
          episodeId,
          userId,
          userName,
          userAvatar,
          content: content.trim(),
          createdAt: new Date().toISOString()
        };

        comments.push(newComment);
        this.saveComments(comments);

        return newComment;
      })
    );
  }

  // Actualizar comentario
  updateComment(commentId: number, userId: number, content: string): Observable<Comment> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const comments = this.getAllComments();
        const commentIndex = comments.findIndex(c => +c.id === commentId);

        if (commentIndex === -1) {
          throw new Error('Comment not found');
        }

        const comment = comments[commentIndex];

        // Verificar que el usuario es el dueño del comentario
        if (comment.userId !== userId) {
          throw new Error('Unauthorized: You can only edit your own comments');
        }

        comment.content = content.trim();
        comment.updatedAt = new Date().toISOString();

        comments[commentIndex] = comment;
        this.saveComments(comments);

        return comment;
      })
    );
  }

  // Eliminar comentario
  deleteComment(commentId: number, userId: number, isAdmin: boolean): Observable<boolean> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const comments = this.getAllComments();
        const comment = comments.find(c => c.id === commentId);

        if (!comment) {
          throw new Error('Comment not found');
        }

        // Solo el dueño o un admin pueden eliminar
        if (comment.userId !== userId && !isAdmin) {
          throw new Error('Unauthorized: You can only delete your own comments');
        }

        const filteredComments = comments.filter(c => c.id !== commentId);
        this.saveComments(filteredComments);

        return true;
      })
    );
  }

  // Deshabilitar comentarios (solo admin)
  toggleCommentsStatus(episodeId: number, isAdmin: boolean): Observable<boolean> {
    return of(null).pipe(
      delay(300),
      map(() => {
        if (!isAdmin) {
          throw new Error('Unauthorized: Only admins can disable comments');
        }

        const config = this.getCommentsConfig();
        const episodeConfig = config.find(c => c.episodeId === episodeId);

        if (episodeConfig) {
          episodeConfig.commentsDisabled = !episodeConfig.commentsDisabled;
        } else {
          config.push({
            episodeId,
            commentsDisabled: true
          });
        }

        this.saveCommentsConfig(config);

        return episodeConfig ? episodeConfig.commentsDisabled : true;
      })
    );
  }

  // Verificar si los comentarios están deshabilitados
  areCommentsDisabled(episodeId: number): boolean {
    if (!this.isBrowser()) return false;

    const config = this.getCommentsConfig();
    const episodeConfig = config.find(c => c.episodeId === episodeId);
    return episodeConfig ? episodeConfig.commentsDisabled : false;
  }
}
