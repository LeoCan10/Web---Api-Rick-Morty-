import { Component, OnInit } from '@angular/core';
import { rickMortyService } from '../../services/rickMorty.service';
import { NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CharacterCardComponent } from '../../components/character-card/character-card.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css'],
  imports: [
    NgForOf,
    RouterLink,
    CharacterCardComponent,
    PaginationComponent,
    FormsModule
  ]
})
export class CharactersComponent implements OnInit {
  characters: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  searchTerm: string = '';  // Var para busqueda

  constructor(private rickMortyService: rickMortyService) {}

  ngOnInit(): void {
    this.loadCharacters(1);
  }

  loadCharacters(page: number): void {
    this.rickMortyService.getCharacters(page, this.searchTerm).subscribe({
      next: (data) => {
        this.characters = data.results;
        this.totalPages = data.info.pages;
        this.currentPage = page;
      },
      error: () => {
        this.characters = [];
        this.totalPages = 1;
        this.currentPage = 1;
      }
    });
  }

  changePage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.loadCharacters(page);
    }
  }

  onSearch(): void {
    this.loadCharacters(1);
  }
}
