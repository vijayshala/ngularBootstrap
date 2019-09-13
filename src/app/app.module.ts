import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

/// Services
import { AuthService } from './services/auth.service';
import { CustomerService } from './services/customer.service';
import { FundService } from './services/fund.service';
 
/// PrimeNG Libraries //
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

/// Components
import { AppComponent } from './app.component';
import { UserAuthenticationComponent } from './user-authentication/user-authentication.component';
import { UserLoginComponent } from './user-authentication/user-login/user-login.component';
import { CommonService } from './services/common.service';
import { FundConstants } from './constants/fund.constants';


@NgModule({
  declarations: [
    AppComponent,
    UserAuthenticationComponent,
    UserLoginComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    TableModule,
    CheckboxModule,
    HttpClientModule,
    InfiniteScrollModule
  ],
  exports: [ TableModule, CheckboxModule],
  providers: [
    AuthService,
    CustomerService,
    FundService,
    CommonService,
    FundConstants
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
