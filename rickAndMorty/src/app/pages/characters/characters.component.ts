import { Component, OnInit } from '@angular/core';
import { rickMortyService } from '../../services/rickMorty.service';
import { NgForOf } from "@angular/common";

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css'],
    imports: [NgForOf]
})
export class CharactersComponent implements OnInit {
  characters: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private rickMortyService: rickMortyService) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(page: number = 1): void {
    this.rickMortyService.getCharacters(page).subscribe((data) => {
      this.characters = data.results;
      this.totalPages = data.info.pages;
      this.currentPage = page;
    });
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.loadCharacters(page);
    }
  }
}
