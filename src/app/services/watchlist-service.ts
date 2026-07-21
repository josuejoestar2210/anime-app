import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {

  constructor (private supabaseService: SupabaseService) {}

  async agregar(animeId: string, tiitulo: string, poster: string | null) {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    if(!userId) throw new Error('Debes iniciar sesión');

    const { data, error } = await this.supabaseService.client
      .from('watchlist')
      .insert({
        user_id: userId,
        anime_id: animeId,
        anime_title: tiitulo,
        anime_poster: poster
      });

    if(error) throw error;
  }

  async quitar(animeId: string) {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    const { error } = await this.supabaseService.client
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('anime_id', animeId);

    if (error) throw error;
  }

  async existeEnWatchlist(animeId: string): Promise<boolean> {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    const {data, error} = await this.supabaseService.client
      .from('watchlist')
      .select('id')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .maybeSingle();

    if(error) throw error;
    return !!data;
  }

  async obtenerWatchlist() {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    const {data, error} = await this.supabaseService.client
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {ascending: false});

    if(error) throw error;
    return data;
  }
}
