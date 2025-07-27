import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { rickMortyService } from '../../services/rickMorty.service';
import { NgForOf, NgIf } from "@angular/common";

@Component({
  selector: 'app-character-detail',
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.css'],
  standalone: true,
  imports: [NgForOf, NgIf]
})
export class CharacterDetailComponent implements OnInit {
  character: any = null;
  episodes: any[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private rickMortyService: rickMortyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCharacter(+id);
    }
  }

  loadCharacter(id: number): void {
    this.loading = true;
    this.error = '';

    this.rickMortyService.getCharacterById(id).subscribe({
      next: (character) => {
        this.character = character;
        this.cdr.detectChanges(); // Forzar detección de cambios

        // Cargar episodios si existen
        if (character.episode && character.episode.length > 0) {
          this.loadEpisodes(character.episode);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading character:', error);
        this.error = 'Error al cargar el personaje';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadEpisodes(episodeUrls: string[]): void {
    this.rickMortyService.getMultipleEpisodes(episodeUrls).subscribe({
      next: (episodes) => {
        // Si es un solo episodio, lo convertimos en array
        this.episodes = Array.isArray(episodes) ? episodes : [episodes];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading episodes:', error);
        this.episodes = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
