import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  mensaje: string = '';
  cargando: boolean = false;
  mostrarPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  async login(loginForm: NgForm) {
    if(loginForm.invalid) return;
    try {
      this.cargando = true;
      this.authService.login(this.email, this.password);
      this.router.navigate(['/']);
    } catch (error: any) {
      this.mensaje = 'Email o contraseña incorrectos';
    } finally {
      this.cargando = false;
    }
  }
}
