import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgForOf } from "@angular/common";

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['../../pages/characters/characters.component.css'],
  standalone: true,
    imports: [NgForOf]
})

export class PaginationComponent {
  @Input() currentPage!: number;
  @Input() totalPages!: number;
  @Input() maxPagesToShow: number = 3;

  @Output() pageChange = new EventEmitter<number>();
  //Calcula paginas visibles (en base a actual y total)
  getVisiblePages(): number[] {
    const pages = [];

    let start = Math.max(1, this.currentPage - Math.floor(this.maxPagesToShow / 2));
    let end = start + this.maxPagesToShow - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - this.maxPagesToShow + 1);
    }
     //llena array de números de página
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  changePage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
