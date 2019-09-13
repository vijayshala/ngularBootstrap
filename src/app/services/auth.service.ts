import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';

import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = environment.baseurl;

  private loggedIn = new BehaviorSubject<boolean>(false); // {1}


  constructor(private https: HttpClient, private route: Router) { }

  get isLoggedIn() {
    return this.loggedIn.asObservable(); // {2}
  }

  public isLoggedInSet(value: any) {
    this.loggedIn.next(value);
  }

  setLogedin() {
    this.loggedIn.next(true);
  }

  setLoginFalse() {
    this.loggedIn.next(false);
  }

  logoutUser() {
    localStorage.setItem('authToken', '');
    this.setLoginFalse();
    this.route.navigateByUrl('user-auth');
    // console.log(localStorage.getItem('authToken'));
  }


  getHeaderWithToken(): any {
    return {
      headers: new HttpHeaders({  /// returns headers with token //
        'Content-Type': 'application/json',
        Authorization:  localStorage.getItem('authToken') ? 'Bearer ' + localStorage.getItem('authToken') : ''
      })
    };
  }

  getHeader() {
    return {  /// returns only headers
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  }

  getHeaderWithForm() {
    return {  /// returns only headers
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
  }

  authenticateUser(username: string, password: string) {
    const userCridentials = `grant_type=password&username=${username}&password=${password}`;
    return this.https.post(`${this.url}token`, userCridentials, this.getHeaderWithForm());
  }

  getUserProfile() {
    return this.https.get(`${this.url}user/GetUser`, this.getHeaderWithToken());
  }

}
