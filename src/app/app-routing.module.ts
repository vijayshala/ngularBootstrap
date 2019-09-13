import { NgModule, ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserAuthenticationComponent } from './user-authentication/user-authentication.component';
import { UserLoginComponent } from './user-authentication/user-login/user-login.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: 'user-auth', component: UserAuthenticationComponent,
    children: [
      {path: '', component: UserLoginComponent}
    ]
  },
  {
    path: 'dashboard',
    loadChildren: './user-dashboard/user-dashboard.module#UserDashboardModule',
    canActivate: [AuthGuard],
    data: {preload: true}
  },

  // { path: 'dashboard', component: }
 // {path: '**', redirectTo: '/user-auth'  }
];

const routing: ModuleWithProviders = RouterModule.forRoot(routes, { enableTracing: false, useHash: true});

@NgModule({
  imports: [routing ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
