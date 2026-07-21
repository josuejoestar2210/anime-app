import { Routes } from '@angular/router';
import { HomeComponent } from './components/home-component/home-component';
import { authGuard } from './guards/auth-guard';
import { LoginComponent } from './components/login-component/login-component';
import { RegistroComponent } from './components/registro-component/registro-component';
import { BuscarComponent } from './components/buscar-component/buscar-component';
import { FavoritosComponent } from './components/favoritos-component/favoritos-component';
import { AnimeDetalleComponent } from './components/anime-detalle-component/anime-detalle-component';
import { WatchlistComponent } from './components/watchlist-component/watchlist-component';
import { NoEncontradoComponent } from './components/no-encontrado-component/no-encontrado-component';
import { ReproductorComponent } from './components/reproductor-component/reproductor-component';

export const routes: Routes = [
    {path: '', component: HomeComponent, canActivate:[authGuard]},
    {path:'login', component: LoginComponent},
    {path:'registro', component: RegistroComponent},
    {path: 'buscar', component: BuscarComponent, canActivate:[authGuard]},
    {path: 'favoritos', component: FavoritosComponent, canActivate:[authGuard]},
    {path:'anime', component: AnimeDetalleComponent, canActivate:[authGuard]},
    {path: 'watchlist', component: WatchlistComponent, canActivate:[authGuard]},
    {path: 'ver', component: ReproductorComponent, canActivate: [authGuard]},
    {path: '**', component: NoEncontradoComponent}
];
