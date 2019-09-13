import { Component, OnInit } from '@angular/core';
import { SharedService } from './services/shared.service';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'operational';

  loader: Observable<boolean>;

  constructor(private sharedService: SharedService, private router: Router, private authService: AuthService ) {}

  ngOnInit() {
    this.loader = this.sharedService.loadingIcon.asObservable();
    if (localStorage.getItem('authToken')) {
      // console.log(localStorage.getItem('authToken'));
      this.authService.isLoggedInSet(true);
    } else {
      // this.authService.isLoggedInSet(false);
    }

  }

}
