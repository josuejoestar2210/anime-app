import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro-component',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './registro-component.html',
  styleUrl: './registro-component.css',
})
export class RegistroComponent {

  username: string = '';
  email: string = '';
  password: string = '';
  confirmarPassword: string = '';
  mensaje: string = '';
  cargando: boolean = false;
  mostrarPassword: boolean = false;
  mostrarConfirmarPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async registrar(registroForm: NgForm) {

    if (registroForm.invalid) return;
    if (this.password !== this.confirmarPassword) {
      this.mensaje = 'Las contraseñas no coinciden';
      return;
    }
    try {
      this.cargando = true;
      await this.authService.register(this.email, this.password, this.username);
      this.router.navigate(['/']);
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        this.mensaje = 'Este email ya está registrado';
      } else {
        this.mensaje = 'Error al registrarse: ' + error.message;
      }
    } finally {
      this.cargando = false;
    }
  }

}
