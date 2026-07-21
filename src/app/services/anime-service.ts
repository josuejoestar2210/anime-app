import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Anime, AnimeSearchResponse, AnimeInfo, AnimeInfoResponse, EpisodeInfo, EpisodeInfoResponse } from '../models/anime.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {

  private baseUrl = environment.animeApi.url;
  // Lista de proveedores que sirven contenido para adultos
  private proveedoresAdultos = ['hentaila', 'hentaila.com'];

  constructor(private http: HttpClient) { }

  search(query: string): Observable<Anime[]> {
    return this.http.get<AnimeSearchResponse>(`${this.baseUrl}/search`, {
      params: { q: query }
    }).pipe(
      map(response => {
        const resultados = response.data.results
          .filter(anime => !this.esContenidoAdulto(anime));
        //Prioriza AnimeAV1 primero, luego el resto
        return resultados.sort((a, b) => {
          const aEsAV1 = a.provider === 'AnimeAV1' ? 0 : 1;
          const bEsAV1 = b.provider === 'AnimeAV1' ? 0 : 1;
          return aEsAV1 - bEsAV1;
        });
      })
    );
  }

  // Obtener detalle + episodios de un anime
  getInfo(url: string): Observable<AnimeInfo> {
    return this.http.get<AnimeInfoResponse>(`${this.baseUrl}/info`, {
      params: { url: url }
    }).pipe(
      map(response => response.data)
    );
  }

  getEpisode(url: string): Observable<EpisodeInfo> {
    return this.http.get<EpisodeInfoResponse>(`${this.baseUrl}/episode`, {
      params: { url: url }
    }).pipe(
      map(response => response.data)
    )
  }

  private esContenidoAdulto(anime: Anime): boolean {
    const provider = (anime.provider || '').toLowerCase();
    const url = (anime.url || '').toLowerCase();
    return this.proveedoresAdultos.some(p => provider.includes(p) || url.includes(p));
  }

  public esAptoParaTodos(anime: Anime): boolean {
    return !this.esContenidoAdulto(anime);
  }
}