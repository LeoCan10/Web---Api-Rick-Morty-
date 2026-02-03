import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Semaphore } from '../utils/semaphore';

/**
 * INTERFAZ DE COMENTARIOS
 * ======================
 * Define la estructura de un comentario en la app.
 * Se guarda en localStorage como JSON.
 */
export interface Comment {
  id: string;                // ID único (timestamp)
  characterId: number;       // ID del personaje sobre el cual es el comentario
  userId: string;           // ID del usuario que creó el comentario
  userName: string;         // Nombre del usuario (para mostrar)
  userAvatar: string;       // Avatar del usuario
  text: string;             // Contenido del comentario
  createdAt: string;        // Fecha de creación (ISO string)
  updatedAt?: string;       // Fecha de última edición (ISO string)
}

/**
 * COMMENTS SERVICE - GESTIÓN DE COMENTARIOS
 * ==========================================
 * Este servicio maneja toda la lógica de comentarios.
 * 
 * IMPORTANTE: Todo se guarda en localStorage del navegador.
 * NO hay backend. Cada usuario tiene sus propios comentarios en su navegador.
 * 
 * ¿DÓNDE ESTÁ LA CONCURRENCIA?
 * - Un usuario puede hacer múltiples acciones rápidamente
 * - Ejemplo: Crea 5 comentarios en 1 segundo
 * - Sin semáforo: podrían todos escribir en localStorage al mismo tiempo
 * - Con semáforo: máximo 3 simultáneos, el resto espera en cola
 */
@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private readonly COMMENTS_KEY = 'rickmorty_comments';

  /**
   * SEMÁFORO - CONTROL DE CONCURRENCIA EN OPERACIONES DE ESCRITURA
   * ===============================================================
   * Máximo 3 operaciones de lectura/escritura simultáneas en localStorage.
   * 
   * Sin esto:
   *   localStorage.setItem('comments', JSON.stringify(data1));  // Petición 1
   *   localStorage.setItem('comments', JSON.stringify(data2));  // Petición 2 (podría sobrescribir)
   *   localStorage.setItem('comments', JSON.stringify(data3));  // Petición 3 (podría sobrescribir)
   *   
   * Con semáforo:
   *   Petición 1 → escribe → libera
   *   Petición 2 → espera → escribe → libera
   *   Petición 3 → espera → escribe → libera
   */
  private requestSemaphore = new Semaphore(3);

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * GET ALL COMMENTS - Lectura sin semáforo
   * =======================================
   * Esta es una lectura simple, no necesita semáforo porque:
   * - localStorage.getItem() es síncrono y atómico
   * - Solo leemos, no escribimos
   * - No hay riesgo de corrupción de datos
   */
  private getAllComments(): Comment[] {
    if (!this.isBrowser()) return [];

    const commentsJson = localStorage.getItem(this.COMMENTS_KEY);
    return commentsJson ? JSON.parse(commentsJson) : [];
  }

  /**
   * SAVE COMMENTS - Escritura con cuidado
   * ======================================
   * Guarda los comentarios en localStorage.
   * Se usa DENTRO del semáforo (en createComment, updateComment, deleteComment)
   * para evitar race conditions.
   */
  private saveComments(comments: Comment[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
    }
  }

  /**
   * GET COMMENTS BY CHARACTER - Lectura sin semáforo
   * ================================================
   * Solo LECTURA, no hay escritura.
   * No necesita semáforo porque:
   * - localStorage.getItem() es atómico (operación indivisible)
   * - Múltiples lecturas pueden ocurrir simultáneamente sin problema
   */
  getCommentsByCharacter(characterId: number): Observable<Comment[]> {
    return new Observable(subscriber => {
      try {
        const allComments = this.getAllComments();  // ← SIN SEMÁFORO (solo lectura)
        const filtered = allComments.filter(c => c.characterId === characterId);
        subscriber.next(filtered.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        subscriber.complete();
      } catch (err) {
        console.error('Error fetching comments', err);
        subscriber.next([]);
        subscriber.complete();
      }
    });
  }

  /**
   * CREATE COMMENT - Escritura CON SEMÁFORO
   * ======================================
   * OPERACIÓN CRÍTICA: Lee, modifica y escribe en localStorage
   * 
   * Paso a paso sin semáforo:
   *   1. Lectura:    const allComments = localStorage.getItem('comments')
   *   2. Modificación: allComments.push(newComment)
   *   3. Escritura:   localStorage.setItem('comments', JSON.stringify(allComments))
   *   
   * PROBLEMA: Si dos operaciones hacen esto simultáneamente:
   *   - Ambas leen allComments (versión anterior)
   *   - Ambas modifican allComments
   *   - Ambas escriben (uno sobrescribe al otro) ❌ PÉRDIDA DE DATOS
   *   
   * SOLUCIÓN CON SEMÁFORO:
   *   Operación 1:
   *     await semaphore.acquire()  → Obtiene permiso
   *     const allComments = ...
   *     allComments.push(...)
   *     localStorage.setItem(...)
   *     semaphore.release()        → Libera permiso
   *   
   *   Operación 2:
   *     await semaphore.acquire()  → ESPERA a que Operación 1 libere
   *     ... (mismo proceso) ...
   */
  createComment(characterId: number, userId: string, userName: string, userAvatar: string, text: string): Observable<Comment> {
    return new Observable(subscriber => {
      // ← ENTRA AL SEMÁFORO: máximo 3 operaciones simultáneas
      this.requestSemaphore.run(async () => {
        try {
          // PASO 1: LECTURA
          const allComments = this.getAllComments();  // ← Lee versión actual

          // PASO 2: CREACIÓN
          const newComment: Comment = {
            id: Date.now().toString(),
            characterId,
            userId,
            userName,
            userAvatar,
            text,
            createdAt: new Date().toISOString()
          };

          // PASO 3: MODIFICACIÓN
          allComments.push(newComment);  // ← Modifica array

          // PASO 4: ESCRITURA (CRÍTICA)
          this.saveComments(allComments);  // ← Escribe en localStorage

          subscriber.next(newComment);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
      // ← SALE DEL SEMÁFORO: libera slot para siguiente operación
    });
  }

  /**
   * UPDATE COMMENT - Escritura CON SEMÁFORO
   * ======================================
   * OPERACIÓN CRÍTICA: Lee, busca, modifica y escribe
   * Mismo patrón que createComment:
   * 
   * Sin semáforo:
   *   Op1: Lee allComments (comentarios A, B, C)
   *   Op2: Lee allComments (comentarios A, B, C)  ← MISMO ESTADO
   *   Op1: Modifica B en su copia
   *   Op2: Modifica C en su copia
   *   Op1: Escribe (A, B modificado, C)
   *   Op2: Escribe (A, B, C modificado)  ← PIERDE CAMBIO DE OP1
   * 
   * Con semáforo:
   *   Op1: Obtiene semáforo → Lee → Modifica → Escribe → Libera
   *   Op2: ESPERA → Obtiene semáforo → Lee (VE el cambio de Op1) → Modifica → Escribe → Libera
   */
  updateComment(commentId: string, text: string): Observable<Comment> {
    return new Observable(subscriber => {
      // ← ENTRA AL SEMÁFORO
      this.requestSemaphore.run(async () => {
        try {
          // LECTURA
          const allComments = this.getAllComments();
          const index = allComments.findIndex(c => c.id === commentId);

          if (index === -1) {
            subscriber.error(new Error('Comentario no encontrado'));
            return;
          }

          // MODIFICACIÓN
          allComments[index].text = text;
          allComments[index].updatedAt = new Date().toISOString();

          // ESCRITURA (con semáforo)
          this.saveComments(allComments);

          subscriber.next(allComments[index]);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
      // ← SALE DEL SEMÁFORO
    });
  }

  /**
   * DELETE COMMENT - Escritura CON SEMÁFORO
   * ======================================
   * OPERACIÓN CRÍTICA: Lee, filtra y escribe
   * 
   * Mismo problema de race condition:
   * - Dos operaciones leen al mismo tiempo
   * - Ambas filtran (eliminan cosas diferentes)
   * - Ambas escriben (uno sobrescribe al otro)
   * 
   * Solución: Semáforo garantiza que se hacen una a la vez
   */
  deleteComment(commentId: string): Observable<boolean> {
    return new Observable(subscriber => {
      // ← ENTRA AL SEMÁFORO
      this.requestSemaphore.run(async () => {
        try {
          // LECTURA
          const allComments = this.getAllComments();
          const filtered = allComments.filter(c => c.id !== commentId);

          if (filtered.length === allComments.length) {
            subscriber.error(new Error('Comentario no encontrado'));
            return;
          }

          // ESCRITURA (con semáforo)
          this.saveComments(filtered);

          subscriber.next(true);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
      // ← SALE DEL SEMÁFORO
    });
  }
}
