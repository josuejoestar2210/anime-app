import { Component, OnInit } from '@angular/core';
import { Episode, EpisodeInfo, StreamServer } from '../../models/anime.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimeService } from '../../services/anime-service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-reproductor-component',
  imports: [CommonModule],
  templateUrl: './reproductor-component.html',
  styleUrl: './reproductor-component.css',
})
export class ReproductorComponent implements OnInit {

  episodeInfo: EpisodeInfo | null = null;
  cargando: boolean = true;
  error: boolean = false;

  idioma: 'sub' | 'dub' = 'sub';
  servidorActivo: StreamServer | null = null;
  safeUrl: SafeResourceUrl | null = null;

  //Contexto que viene desde el detalle del anime
  episodios: Episode[] = [];
  animeTitle: string = '';
  animeUrl: string = '';
  episodioActualUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private animeService: AnimeService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    //Recupera el contexto pasado por navigate(state: {...})
    const state = history.state;
    this.episodios = state?.episodes || [];
    this.animeTitle = state?.animeTitle || '';
    this.animeUrl = state?.animeUrl || '';

    this.route.queryParams.subscribe(params => {
      const url = params['url'];
      if (url) {
        this.episodioActualUrl = url;
        this.cargarEpisodio(url);
      } else {
        this.router.navigate(['/buscar']);
      }
    });
  }

  cargarEpisodio(url: string) {
    this.cargando = true;
    this.error = false;
    this.episodeInfo = null;
    this.safeUrl = null;

    this.animeService.getEpisode(url).subscribe({
      next: (data) => {
        this.episodeInfo = data;
        this.cargando = false;

        //Elige el idioma que sí tenga servidores disponibles
        this.idioma = data.servers.sub.length > 0 ? 'sub' : 'dub';
        this.seleccionarServidor(this.servidoresDisponibles[0]);
      },
      error: (err) => {
        console.error('Error al cargar episodio:', err);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  get servidoresDisponibles(): StreamServer[] {
    if (!this.episodeInfo) return [];
    return this.idioma === 'sub'
      ? this.episodeInfo.servers.sub
      : this.episodeInfo.servers.dub;
  }

  cambiarIdioma(idioma: 'sub' | 'dub') {
    this.idioma = idioma;
    this.seleccionarServidor(this.servidoresDisponibles[0]);
  }

  seleccionarServidor(servidor: StreamServer | undefined) {
    if (!servidor) {
      this.servidorActivo = null;
      this.safeUrl = null;
      return;
    }
    this.servidorActivo = servidor;
    //Angular bloquea iframes externos por seguridad - le decimos explícitamente que confíamos en este URL
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(servidor.url);
  }

  irAEpisodio(episdio: Episode) {
    this.router.navigate(['/ver'], {
      queryParams: { url: episdio.url },
      state: {
        episodes: this.episodios,
        animeTitle: this.animeTitle,
        animeUrl: this.animeUrl
      },
      replaceUrl: true
    });
  }

  volver() {
    if (this.animeUrl) {
      this.router.navigateByUrl(`/anime?url=${encodeURIComponent(this.animeUrl)}`, {
        replaceUrl: true  // ← reemplaza la entrada actual del historial en vez de crear una nueva
      });
    } else {
      this.location.back();
    }
  }

  get indiceActual(): number {
    return this.episodios.findIndex(ep => ep.url === this.episodioActualUrl);
  }

  get tieneAnterior(): boolean {
    return this.indiceActual > 0;
  }

  get tieneSiguiente(): boolean {
    return this.indiceActual >= 0 && this.indiceActual < this.episodios.length - 1;
  }

  episodioAnterior() {
    if (this.tieneAnterior) {
      this.irAEpisodio(this.episodios[this.indiceActual - 1]);
    }
  }

  episodioSiguiente() {
    if (this.tieneSiguiente) {
      this.irAEpisodio(this.episodios[this.indiceActual + 1]);
    }
  }
}
