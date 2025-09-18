import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class rickMortyService {
  private baseUrl = 'https://rickandmortyapi.com/api';

  constructor(private http: HttpClient) {}

  getCharacters(page: number = 1, name: string = ''): Observable<any> {
    let url = `${this.baseUrl}/character/?page=${page}`;
    if (name && name.trim() !== '') {
      url += `&name=${name}`;
    }
    return this.http.get(url);
  }

  getCharacterById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/character/${id}`);
  }

  getEpisode(url: string): Observable<any> {
    return this.http.get(url);
  }

  getMultipleEpisodes(urls: string[]): Observable<any> {
    const episodeIds = urls.map(url => url.split('/').pop()).join(',');
    return this.http.get(`${this.baseUrl}/episode/${episodeIds}`);
  }

  getCharactersList(): Observable<any> {
    return this.getCharacters();
  }
}
