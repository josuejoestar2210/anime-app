import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  //Registro de usuario
  async register(email: string, password: string, username: string) {
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password,
      options: {
        data: { username: username }  
      }
    });

    if (error) throw error;
    return data;
  }

  //Login
  async login(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth
      .signInWithPassword({ email, password });

    if (error) throw error;
    return data;
  }

  //Cerrar Sesión
  async logout() {
    const { error } = await this.supabaseService.client.auth.signOut();
    if (error) throw error;
    this.router.navigate(['/login']);
  }

  //Obtener usuario actual
  async getCurrentUser() {
    const { data } = await this.supabaseService.client.auth.getUser();
    return data.user;
  }

  //Verificar si hay sesión activa
  async isLoggedIn(): Promise<boolean> {
    const { data } = await this.supabaseService.client.auth.getSession();
    return !!data.session;
  }

  //Escuchar cambios de sesión en tiempo real
  onAuthChange(callback: (session: any) => void) {
    return this.supabaseService.client.auth
      .onAuthStateChange((_event, session) => {
        callback(session);
      })
  }
}
