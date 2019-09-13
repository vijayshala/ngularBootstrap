import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate  {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
      return this.authService.isLoggedIn;       // {1}
      // let url: string = state.url;
      // return this.checkLogin(url);
  }

  // checkLogin(url: string): boolean {
  //   if (this.authService.isLoggedIn) { return true; }

  //   // Store the attempted URL for redirecting
  //   // this.sharedService.redirectUrl = url;

  //   // Navigate to the login page with extras
  //   this.router.navigate(['/login']);
  //   return false;
  // }
}
