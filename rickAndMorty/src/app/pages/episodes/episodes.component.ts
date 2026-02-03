import { Component, OnInit } from '@angular/core';
import { rickMortyService } from '../../services/rickMorty.service';
import { AuthService } from '../../services/auth.service';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-episodes',
  standalone: true,
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.css'],
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
    PaginationComponent,
    FormsModule,
  ]
})
export class EpisodesComponent implements OnInit {
  episodes: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  searchTerm: string = '';

  constructor(
    private rickMortyService: rickMortyService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEpisodes(1);
  }

  loadEpisodes(page: number): void {
    this.rickMortyService.getEpisodes(page, this.searchTerm).subscribe({
      next: (data) => {
        this.episodes = data.results;
        this.totalPages = data.info.pages;
        this.currentPage = page;
      },
      error: () => {
        this.episodes = [];
        this.totalPages = 1;
        this.currentPage = 1;
      }
    });
  }

  changePage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.loadEpisodes(page);
    }
  }

  onSearch(): void {
    this.loadEpisodes(1);
  }

  isFavorite(episodeId: number): boolean {
    return this.authService.isFavoriteEpisode(episodeId);
  }

  toggleFavorite(episodeId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.authService.toggleFavoriteEpisode(episodeId).subscribe({
      next: () => {
        console.log('Favorito actualizado');
      },
      error: (error) => {
        console.error('Error al actualizar favorito:', error);
      }
    });
  }
}
