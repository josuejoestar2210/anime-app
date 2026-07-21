import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Reseña {
  id?: string;
  user_id?: string;
  username?: string;
  anime_id: string;
  anime_title: string;
  rating: number;
  comment: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReseñasService {

  constructor(private supabaseService: SupabaseService) { }

  //Crear una reseña 
  async crear(animeId: string, animeTitle: string, rating: number, comment: string) {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) throw new Error('Debes iniciar sesión');

    const { data, error } = await this.supabaseService.client
      .from('reviews')
      .insert({
        user_id: userId,
        anime_id: animeId,
        anime_title: animeTitle,
        rating: rating,
        comment: comment
      })
      .select();

    if (error) throw error;
    return data;
  }

  //Obtener todas las reseñas de un anime (con el username del autor)
  async obtenerPorAnime(animeId: string): Promise<Reseña[]> {
    const { data, error } = await this.supabaseService.client
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id,
        profiles (username)  
      `)
      .eq('anime_id', animeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    //Aplanamos el username que viene anidado desde profiles
    return (data || []).map((r: any) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      user_id: r.user_id,
      anime_id: animeId,
      anime_title: '',
      username: r.profiles?.username || 'Usuario'
    }));
  }

  // Verificar si el usuario actual ya reseñó este anime
  async miReseña(animeId: string): Promise<Reseña | null> {
    const user = await this.supabaseService.client.auth.getUser();
    const userId = user.data.user?.id;

    const { data, error } = await this.supabaseService.client
      .from('reviews')
      .select('*')
      .eq('anime_id', animeId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  //Actualizar una reseña existente
  async actualizar(reseñaId: string, rating: number, comment: string) {
    const { data, error } = await this.supabaseService.client
      .from('reviews')
      .update({ rating, comment })
      .eq('id', reseñaId)
      .select();

    if (error) throw error;
    return data;
  }

  //Eliminar una reseña
  async eliminar(reseñaId: string) {
    const { error } = await this.supabaseService.client
      .from('reviews')
      .delete()
      .eq('id', reseñaId);

    if (error) throw error;
  }

  //Calcular promedio de calificación
  calcularPromedio(reseñas: Reseña[]): number {
    if (reseñas.length === 0) return 0;
    const suma = reseñas.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((suma / reseñas.length) * 10) / 10;
  }
}
