import { Component, OnInit, AfterContentInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { Subscription } from 'rxjs';
import { AlertPopup } from './user.class';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { UserProfile } from './user.class';
@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, AfterContentInit, OnDestroy {

  sideMenuState: boolean;
  menuList: any = [];
  seletedMenuItem: any;
  alertPopup = new AlertPopup(); // = {show: false, message: '', confirm: false, header: ''}; // : Boolean = false;
  alertSubs: Subscription;

  alertValues: any;

  user = new UserProfile();

  constructor(private route: Router, private _shareds: SharedService, private toastMsgService: MessageService,
    private authService: AuthService) { }

  ngOnInit() {
    this.sideMenuState = false;
    this.menuList = [
      // {name: 'Home', path: '/dashboard/home', icon: 'icon_home.png', active: false, permission: true },
      {name: 'Customers', path: '/dashboard/customers', icon: 'icon_customer.png', active: false, permission: true },
      {name: 'Funds', path: '/dashboard/funds', icon: 'icon_funds.png', active: false, permission: true },
      {name: 'distributions', path: '/dashboard/distributions', icon: 'icon_distributions.png', active: false, permission: true },
    ];

    this.alertSubs = this._shareds.confirmationPopup$.subscribe((res: any) => {
     // console.log(res);
      if (res.hasOwnProperty('options') &&  res.options === 'open') {
        this.alertValues = res;
        this.alertPopup = {
          show: res.show , message: res.message, confirm: false, type: res.type,
          header: res.customHeader ? res.customHeader : `${res.type} ${res.callfrom}`, callfrom: res.callfrom, deleteType: res.deleteType
        };
        
      }
      if (res.hasOwnProperty('options') &&  res.options === 'close') {
        this.closePopup();
      }
    });

    this._shareds.toastMsg$.subscribe((res: any) => {
      if (res.hasOwnProperty('options') && res.options === 'alert') {
        this.showToast(res);
      }
    });

    setTimeout(() => {
      this.getUserProfileDetails();
    }, 0);
  }

  ngOnDestroy() {
    this.alertSubs.unsubscribe();
  }

  ngAfterContentInit() {
    if (this.route.url) {
      this.seletedMenuItem = this.menuList.filter((ml: any) =>  ml.path.includes(this.route.url) )[0];
    }

    this.route.events.subscribe((res: any) => {
      if (res instanceof NavigationEnd) {
        if (this.route.url.includes('/dashboard/customers/')){
          this.seletedMenuItem = this.menuList.filter((ml: any) =>  ml.name === 'Customers' )[0];
        }
      }
    });

  }

  toggleSideBar() {
    this.sideMenuState = !this.sideMenuState;
  }

  logoutUser() {
    // this.route.navigateByUrl('/user-auth');
    this.authService.logoutUser();
  }

  onMenuSelect(item: any) {
    // Hide filter pane on side menu toggle
    this._shareds.toggleSideBar(false);
    this.seletedMenuItem = item;
  }

  closePopup() {
    this.alertPopup = new AlertPopup(); // = {show: false, message: '', confirm: false, header: ''};
  }

  openAlertPopup() {
    this.alertPopup = new AlertPopup(); // {show: true, message: 'testing popup', confirm: false, header: ''};
  }

  addFn() {
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom, type: 'add'});
  }

  deleteListFn() {
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom ,
      type: 'delete-list', deleteType: this.alertValues.deleteType });
  }

  deleteFn() {
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom ,
      type: 'delete', deleteType: this.alertValues.deleteType });
  }

  linkfn() {
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom , type: 'link'});
  }

  unLinkListFn() {
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom , type: 'unlink-list'});
  }
  unLinkFn(){
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom , type: 'unlink'});
  }
  updateRecordFn() {
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom , type: 'update'});
  }

  moveRecordFn() {
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom , type: 'move'});
  }

  sourceFundFn() {
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom , type: 'source'});
  }

  uploadPermissionFn() {
    this._shareds.callConfirmPopup({options: 'close', show: false, callfrom: this.alertValues.callfrom , type: 'upload'});
  }


  // Toast Msgs //
  showToast(obj: any) {
    this.toastMsgService.add({severity: 'info',  detail: obj.msg, life: 4000 });
  }

  hideToast() {
    this.toastMsgService.clear();
  }


  getUserProfileDetails() {
    this._shareds.waitingSign(true);
    this.authService.getUserProfile().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.user = result['Data'];
        this._shareds.shareUserProfile({options: 'userProfile', userDetails: this.user, type: 'onload'});
        // console.log('userd sd ad asd', this.user);
      }
    }, (error: any) => {
      if (error && error['status'] === 401) {
        this.authService.logoutUser();
        this._shareds.waitingSign(false);
      }
    }, () => {
      this._shareds.waitingSign(false);
    });
  }

}
