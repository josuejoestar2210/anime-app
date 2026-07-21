import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FavoritosService } from '../../services/favoritos-service';
import { WatchlistService } from '../../services/watchlist-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Anime } from '../../models/anime.model';
import { AnimeService } from '../../services/anime-service';

interface AnimeItem {
  id: string;
  anime_id: string;
  anime_title: string;
  anime_poster: string | null;
}

interface Recomendacion {
  genero: string;
  animes: Anime[];
}

@Component({
  selector: 'app-home-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {

  username: string = '';
  busqueda: string = '';
  favoritos: AnimeItem[] = [];
  watchlist: AnimeItem[] = [];
  recomendaciones: Recomendacion[] = [];
  cargando: boolean = true;
  cargandoRecomendaciones: boolean = false;

  generos: string[] = [
    'Accion', 'Aventura', 'Romance', 'Terror',
    'Shonen', 'Seinen', 'Comedia', 'Fantasy',
    'Misterio', 'Ciencia Ficción'
  ];

  constructor(
    private authService: AuthService,
    private favoritosService: FavoritosService,
    private watchlistService: WatchlistService,
    private animeService: AnimeService,
    private router: Router
  ) { }

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.username = user.user_metadata?.['username'] || 'Bienvenido';
    }
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      const [favs, watch] = await Promise.all([
        this.favoritosService.obtenerFavoritos(),
        this.watchlistService.obtenerWatchlist()
      ]);
      this.favoritos = (favs as AnimeItem[]).slice(0, 12);
      this.watchlist = (watch as AnimeItem[])
        .filter((w: any) => !w.watched)
        .slice(0, 12);

      //Cargar recomendaciones basadas en géneros populares del usuario
      await this.cargarRecomendaciones();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async cargarRecomendaciones() {
    this.cargandoRecomendaciones = true;

    // Géneros que usamos para buscar recomendaciones
    // Si el usuario tiene favoritos usamos géneros variados, si no, populares por defecto
    const generosParaBuscar = this.favoritos.length > 0
      ? ['Shonen', 'Accion', 'Aventura']
      : ['Shonen', 'Accion', 'Romance'];

    try {
      const promesas = generosParaBuscar.map(genero =>
        this.animeService.search(genero).toPromise().then(animes => ({
          genero,
          // filtramos los que ya tiene en favoritoss o watchlist
          animes: (animes || [])
            .filter(a => this.animeService.esAptoParaTodos(a))
            .filter(a => !this.favoritos.some(f => f.anime_id === a.url))
            .filter(a => !this.watchlist.some(w => w.anime_id === a.url))
            .filter(a => a.image !== null) // solo con imagen
            .slice(0, 12)
        }))
      );

      const resultados = await Promise.all(promesas);
      // Solo mostramos filas que tengan al menos 3 resultados
      this.recomendaciones = resultados.filter(r => r.animes.length >= 3);
    } catch (error) {
      console.error('Error aal cargar recomendaciones:', error);
    } finally {
      this.cargandoRecomendaciones = false;
    }
  }

  buscar() {
    if (this.busqueda.trim()) {
      this.router.navigate(['/buscar'], {
        queryParams: { q: this.busqueda }
      });
    }
  }

  buscarGenero(genero: string) {
    this.router.navigate(['/buscar'], {
      queryParams: { q: genero }
    });
  }

  verAnime(animeId: string) {
    this.router.navigate(['/anime'], {
      queryParams: { url: animeId }
    });
  }
}
