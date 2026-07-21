import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {

  constructor(private supabaseService: SupabaseService) {}

  //Agregar a favoritos
  async agregar(animeId: string, titulo: string, poster: string | null) {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    if(!userId) throw new Error('Debes iniciar sesión');

    const { data, error } = await this.supabaseService.client
      .from('favorites')
      .insert({
        user_id: userId,
        anime_id: animeId,
        anime_title: titulo,
        anime_poster: poster
      });

      if(error) throw error;
      return data;
  }

  //Quitar de favoritos
  async quitar(animeId: string) {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    const { error } = await this.supabaseService.client
      .from('favorites')
      .delete()
      .eq('user_id', userId)

      if(error) throw error;
  }

  //Verificar si ya está en favoritos
  async existeFavorito(animeId: string): Promise<boolean> {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    const { data, error} = await this.supabaseService.client
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .maybeSingle();

    if(error) throw error;
    return !!data;
  }

  //Obtener todos los favoritos del usuario
  async obtenerFavoritos() {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    const {data, error} = await this.supabaseService.client
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {ascending: false});

      if(error) throw error;
      return data;
  }
}
