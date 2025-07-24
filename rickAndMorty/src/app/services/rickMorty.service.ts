import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})

export class rickMortyService {
  getCharacters(page: number = 1): Observable<any> {
  return this.http.get(`https://rickandmortyapi.com/api/character/?page=${page}`);
}
  constructor(private http: HttpClient) {}

  getCharactersList(): Observable<any> {
    return this.getCharacters();
  }

}
