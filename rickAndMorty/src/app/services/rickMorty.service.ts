import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class rickMortyService {
  getEpisodesByUrls(episodeUrls: string[]) {
    throw new Error('Method not implemented.');
  }
  private baseUrl = 'https://rickandmortyapi.com/api';

  constructor(private http: HttpClient) {}

  getCharacters(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/character/?page=${page}`);
  }

  getCharacterById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/character/${id}`);
  }

  getEpisode(url: string): Observable<any> {
    return this.http.get(url);
  }

  getMultipleEpisodes(urls: string[]): Observable<any> {
    // Extraer los IDs de los episodios de las URLs
    const episodeIds = urls.map(url => url.split('/').pop()).join(',');
    return this.http.get(`${this.baseUrl}/episode/${episodeIds}`);
  }

  getCharactersList(): Observable<any> {
    return this.getCharacters();
  }
}
