import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';


@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

  userForm = new FormGroup({});
  loadingIcon: boolean;


  constructor(private routing: Router, private authService: AuthService, private sharedService: SharedService) { }

  ngOnInit() {
    this.userForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  // check white space at initial
  noWhitespace(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
  }


  gotoDash() {
    this.authService.isLoggedInSet(true);
    this.routing.navigateByUrl('dashboard/home');
    //  this.sharedService.waitingSign(true);
  }

  loginUser() {
    this.sharedService.waitingSign(true);
    this.loadingIcon = true;
    this.authService.authenticateUser(this.userForm.value.username, this.userForm.value.password)
      .subscribe((result: any) => {
        if (result && result['access_token']) {
         // console.log(result);
          localStorage.setItem('authToken', result['access_token']);
          this.authService.isLoggedInSet(true);
          this.routing.navigateByUrl('dashboard/customers');
        }
      }, (error) => {
        console.warn(error);
        // this.loadingIcon = false; // this.sharedService.waitingSign(false);
      }, () => {
        setTimeout(() => {
          this.sharedService.waitingSign(false);
          this.loadingIcon = false;
        }, 500);
      });
  }

}
