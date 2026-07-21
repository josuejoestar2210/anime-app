import { Component, OnInit } from '@angular/core';
import { AnimeInfo, Episode } from '../../models/anime.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimeService } from '../../services/anime-service';
import { FavoritosService } from '../../services/favoritos-service';
import { WatchlistService } from '../../services/watchlist-service';
import { CommonModule, Location } from '@angular/common';
import { Reseña, ReseñasService } from '../../services/reseñas-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-anime-detalle-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './anime-detalle-component.html',
  styleUrl: './anime-detalle-component.css',
})
export class AnimeDetalleComponent implements OnInit {

  anime: AnimeInfo | null = null;
  cargando: boolean = true;
  error: boolean = false;
  esFavorito: boolean = false;
  enWatchlist: boolean = false;
  procesando: boolean = false;

  //Propiedades Reseñas
  resenas: Reseña[] = [];
  miResena: Reseña | null = null;
  promedioRating: number = 0;
  cargandoResenas: boolean = true;
  enviandoResena: boolean = false;

  //Formulario de nueva reseña
  nuevoRating: number = 0;
  nuevoComentario: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private animeService: AnimeService,
    private favoritesService: FavoritosService,
    private watchlistService: WatchlistService,
    private reseñasService: ReseñasService,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const url = params['url'];
      if (url) {
        this.cargarAnime(url);
      } else {
        this.router.navigate(['/buscar']);
      }
    });
  }

  async cargarAnime(url: string) {
    this.cargando = true;
    this.error = false;

    this.animeService.getInfo(url).subscribe({
      next: async (data) => {
        data.episodes = data.episodes.sort((a, b) => (a.number || 0) - (b.number || 0));
        this.anime = data;
        this.cargando = false;

        // Usamos la URL como identificador único, no el id (puede venir null)
        const animeId = data.url;
        this.esFavorito = await this.favoritesService.existeFavorito(animeId);
        this.enWatchlist = await this.watchlistService.existeEnWatchlist(animeId);

        await this.cargarReseñas(animeId);
      },
      error: (err) => {
        console.error('Error al cargar anime:', err);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  async cargarReseñas(animeId: string) {
    this.cargandoResenas = true;
    try {
      this.resenas = await this.reseñasService.obtenerPorAnime(animeId);
      this.promedioRating = this.reseñasService.calcularPromedio(this.resenas);
      this.miResena = await this.reseñasService.miReseña(animeId);

      if (this.miResena) {
        this.nuevoRating = this.miResena.rating;
        this.nuevoComentario = this.miResena.comment;
      }
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
    } finally {
      this.cargandoResenas = false;
    }
  }

  seleccionarRating(estrella: number) {
    this.nuevoRating = estrella;
  }

  async enviarResena() {
    if (!this.anime || this.nuevoRating === 0 || this.enviandoResena) return;
    this.enviandoResena = true;

    try {
      if (this.miResena?.id) {
        await this.reseñasService.actualizar(this.miResena.id, this.nuevoRating, this.nuevoComentario);
      } else {
        await this.reseñasService.crear(this.anime.url, this.anime.title, this.nuevoRating, this.nuevoComentario);
      }
      await this.cargarReseñas(this.anime.url);
    } catch (error) {
      console.error('Error al enviar reseña:', error);
    } finally {
      this.enviandoResena = false;
    }
  }

  async eliminarResena() {
    if(!this.miResena?.id || !this.anime) return;
    if(!confirm('¿Seguro que deseas eliminar tu reseña?')) return;

    try {
      await this.reseñasService.eliminar(this.miResena.id);
      this.miResena = null;
      this.nuevoRating = 0;
      this.nuevoComentario = '';
      await this.cargarReseñas(this.anime.url);
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
    }
  }

  async toggleFavorito() {
    if (!this.anime || this.procesando) return;
    this.procesando = true;

    try {
      const animeId = this.anime.url;  // ← antes: this.anime.id.toString()
      if (this.esFavorito) {
        await this.favoritesService.quitar(animeId);
        this.esFavorito = false;
      } else {
        await this.favoritesService.agregar(animeId, this.anime.title, this.anime.image);
        this.esFavorito = true;
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    } finally {
      this.procesando = false;
    }
  }

  async toggleWatchlist() {
    if (!this.anime || this.procesando) return;
    this.procesando = true;

    try {
      const animeId = this.anime.url;  // ← antes: this.anime.id.toString()
      if (this.enWatchlist) {
        await this.watchlistService.quitar(animeId);
        this.enWatchlist = false;
      } else {
        await this.watchlistService.agregar(animeId, this.anime.title, this.anime.image);
        this.enWatchlist = true;
      }
    } catch (error) {
      console.error('Error al actualizar watchlist:', error);
    } finally {
      this.procesando = false;
    }
  }

  verEpisodio(episodio: Episode) {
    this.router.navigate(['/ver'], {
      queryParams: { url: episodio.url },
      state: {
        episodes: this.anime?.episodes || [],
        animeTitle: this.anime?.title || '',
        animeUrl: this.anime?.url || ''
      }
    });
  }

  // volver() {
  //   //Si venimos de buscar/favoritos/watchlist, back() funciona bien
  //   //Si venimos del reproductor, evitamos el ciclo yendo directo a /buscar
  //   const referrer = document.referrer;
  //   const vieneDelReproductor = this.router.url.includes('/anime') &&
  //                               history.state?.desdeReproductor;

  //   if (vieneDelReproductor) {
  //     this.router.navigate(['/buscar']);
  //   } else {
  //     this.location.back();
  //   }
  // }
  volver() {
    this.location.back();
  }
}
