import { Component, OnInit } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private rickMortyService: rickMortyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCharacter(+id);
    }
  }

  loadCharacter(id: number): void {
    this.rickMortyService.getCharacterById(id).subscribe(character => {
      this.character = character;
      this.loadEpisodes(character.episode);
    });
  }

  loadEpisodes(episodeUrls: string[]): void {
    // El servicio debe tener un método para obtener múltiples episodios por URLs o ids
    this.rickMortyService.getEpisodesByUrls(episodeUrls).subscribe(episodes => {
      this.episodes = episodes;
    });
  }
}
