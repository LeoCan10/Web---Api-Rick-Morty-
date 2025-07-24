import { Component, OnInit } from '@angular/core';
import { rickMortyService } from '../../services/rickMorty.service';
import { NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css'],
  imports: [NgForOf, RouterLink, CharacterCardComponent, PaginationComponent]
})
export class CharactersComponent implements OnInit {
  characters: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private rickMortyService: rickMortyService) {}

  ngOnInit(): void {
    this.loadCharacters(1);
  }

  loadCharacters(page: number): void {
    this.rickMortyService.getCharacters(page).subscribe((data) => {
      this.characters = data.results;
      this.totalPages = data.info.pages;
      this.currentPage = page;
    });
  }

  changePage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.loadCharacters(page);
    }
  }
}
