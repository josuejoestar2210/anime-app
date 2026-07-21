import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { WatchlistService } from '../../services/watchlist-service';
import { Router, RouterLink } from '@angular/router';

interface WatchlistItem {
  id: string;
  anime_id: string;
  anime_title: string;
  anime_poster: string | null;
  watched: boolean;
  created_at: string;
}

@Component({
  selector: 'app-watchlist-component',
  imports: [RouterLink],
  templateUrl: './watchlist-component.html',
  styleUrl: './watchlist-component.css',
})
export class WatchlistComponent implements OnInit {

  watchlist: WatchlistItem[] = [];
  cargando: boolean = true;
  procesandoId: string | null = null;

  constructor(
    private watchlistService: WatchlistService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarWatchlist();
  }

  async cargarWatchlist() {
    this.cargando = true;
    try {
      const data = await this.watchlistService.obtenerWatchlist();
      this.watchlist = data as WatchlistItem[];
    } catch (error) {
      console.error('Error al cargar watchlist:', error);
    } finally {
      this.cargando = false;
    }
  }

  verDetalle(item: WatchlistItem) {
    this.router.navigate(['/anime'], {
      queryParams: { url: item.anime_id }
    });
  }

  async quitar(item: WatchlistItem, event: Event) {
    event.stopPropagation();
    this.procesandoId = item.id;
    try {
      await this.watchlistService.quitar(item.anime_id);
      this.watchlist = this.watchlist.filter(w => w.id !== item.id);
    } catch (error) {
      console.error('Error al quitar de watchlist:', error);
    } finally {
      this.procesandoId = null;
    }
  }

  //Pendientes = los que aún no has visto
  get pendientes() {
    return this.watchlist.filter(w => !w.watched);
  }
}
