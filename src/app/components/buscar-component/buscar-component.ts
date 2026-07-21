import { Component, OnInit } from '@angular/core';
import { Anime } from '../../models/anime.model';
import { AnimeService } from '../../services/anime-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscar-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-component.html',
  styleUrl: './buscar-component.css',
})
export class BuscarComponent implements OnInit {

  query: string = '';
  resultados: Anime[] = [];
  cargando: boolean = false;
  busquedaRealizada: boolean = false;

  constructor(
    private animeService: AnimeService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    //Lee el parámetro ?q= que viene desde el home
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      if (q) {
        this.query = q;
        this.buscar();
      }
    });
  }

  buscar() {
    if (!this.query.trim()) return;

    this.cargando = true;
    this.busquedaRealizada = true;

    this.animeService.search(this.query).subscribe({
      next: (resultados) => {
        this.resultados = resultados;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al buscar:', error);
        this.resultados = [];
        this.cargando = false;
      }
    });

    //Actualiza la URL sin recargar la página
    this.router.navigate([], {
      queryParams: { q: this.query },
      relativeTo: this.route
    });
  }

  verDetalle(anime: Anime) {
    this.router.navigate(['/anime'], {
      queryParams: { url: anime.url, provider: anime.provider }
    });
  }
}
