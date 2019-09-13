import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { UserDashboardComponent } from './user-dashboard.component';
import { HomeComponent } from './home/home.component';
import { CustomersComponent } from './customers/customers.component';
import { FundsComponent } from './funds/funds.component';

/// Libraries
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import {InputSwitchModule} from 'primeng/inputswitch';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {SelectButtonModule} from 'primeng/selectbutton';
import {CalendarModule} from 'primeng/calendar';
import {ListboxModule} from 'primeng/listbox';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

/// Pipes//
import { CustomerListPipe } from '../filters/customer-list.pipe';
import { ContactsComponent } from './customers/contacts/contacts.component';
import { LinkedSourceFundsComponent } from './customers/linked-source-funds/linked-source-funds.component';
import { LinkedPendingFundsComponent } from './customers/linked-pending-funds/linked-pending-funds.component';
import { FundContactsComponent } from './funds/fund-contacts/fund-contacts.component';
import { SourceFundsComponent } from './funds/source-funds/source-funds.component';
import { PendingFundsComponent } from './funds/pending-funds/pending-funds.component';
import { JunkFundsComponent } from './funds/junk-funds/junk-funds.component';
import { ExportSettingComponent } from './customers/export-setting/export-setting.component';

import { LoadingIconComponent } from '../common/loading-icon/loading-icon.component';
import { FundFiltersComponent } from './funds/filter/fund-filters.component';
import { DistributionsComponent } from './distributions/distributions.component';

const routes: Routes = [
  // { path: '', pathMatch: 'full', redirectTo: 'user' },
  {
    path: '',
    component: UserDashboardComponent,
    children: [
      // {  path: 'home',  component: HomeComponent },
      {  path: 'customers',  component: CustomersComponent  },
      {  path: 'customers/:cname',  component: CustomersComponent  },
      {  path: 'funds',  component: FundsComponent  },
      {  path: 'distributions',  component: DistributionsComponent  },
    ]
  }

];


@NgModule({
  declarations: [
    UserDashboardComponent,
    HomeComponent,
    CustomersComponent,
    CustomerListPipe,
    FundsComponent,
    FundFiltersComponent,
    ContactsComponent,
    LinkedSourceFundsComponent,
    LinkedPendingFundsComponent,
    FundContactsComponent,
    SourceFundsComponent,
    PendingFundsComponent,
    JunkFundsComponent,
    ExportSettingComponent,
    LoadingIconComponent,
    DistributionsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CheckboxModule,
    RadioButtonModule,
    InputSwitchModule,
    ToastModule,
    SelectButtonModule,
    InfiniteScrollModule,
    CalendarModule,
    ListboxModule
  ],
  providers: [MessageService]
})
export class UserDashboardModule { }
