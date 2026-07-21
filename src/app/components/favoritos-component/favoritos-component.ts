import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { FavoritosService } from '../../services/favoritos-service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface FavoritoItem {
  id: string;
  anime_id: string;
  anime_title: string;
  anime_poster: string | null;
  created_at: string;
}

@Component({
  selector: 'app-favoritos-component',
  imports: [RouterLink, CommonModule],
  templateUrl: './favoritos-component.html',
  styleUrl: './favoritos-component.css',
})
export class FavoritosComponent implements OnInit {

  favoritos: FavoritoItem[] = [];
  cargando: boolean = true;
  quitandoId: string | null = null;

  constructor(
    private favoritosService: FavoritosService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarFavoritos();
  }

  async cargarFavoritos() {
    this.cargando = true;
    try {
      const data = await this.favoritosService.obtenerFavoritos();
      this.favoritos = data as FavoritoItem[];
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    } finally {
      this.cargando = false;
    }
  }

  verDetalle(item: FavoritoItem) {
    // anime_id guarda la URL del anime (así lo definimos en el detalle)
    this.router.navigate(['/anime'], {
      queryParams: { url: item.anime_id }
    });
  }

  async quitar(item: FavoritoItem, event: Event) {
    event.stopPropagation(); // evita que el click también dispare verDetalle()
    this.quitandoId = item.id;

    try {
      await this.favoritosService.quitar(item.anime_id);
      this.favoritos = this.favoritos.filter(f => f.id !== item.id);
    } catch (error) {
      console.error('Error al quitar favorito:', error);
    } finally {
      this.quitandoId = null;
    }
  }
}
