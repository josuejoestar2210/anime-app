import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-component',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css',
})

export class NavbarComponent implements OnInit {

  username: string = '';
  menuAbierto: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      //obtener username del metadata
      this.username = user.user_metadata?.['username'] || user.email || '';
    }
  }

  async cerrarSesion() {
    await this.authService.logout();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}
