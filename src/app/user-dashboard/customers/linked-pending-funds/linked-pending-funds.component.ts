import { Component, OnInit, Input, OnChanges, ɵConsole, OnDestroy } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
import { CustomerService } from 'src/app/services/customer.service';

import { LinkedPendingAddEdit } from '../customer.model';
import { FundService } from 'src/app/services/fund.service';
import { UserProfile } from '../../user.class';

@Component({
  selector: 'app-linked-pending-funds',
  templateUrl: './linked-pending-funds.component.html',
  styleUrls: ['./linked-pending-funds.component.css']
})
export class LinkedPendingFundsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() customerId: number;
  @Input() ffamilyList: Array<any>;
  @Input() user: UserProfile;
  @Input() fundFilter:any;
  callApi: boolean;  // temporary fix for duplicate subscription
  toggleState: boolean;
  searchText: string = "";
  editedFund: any;
  newPendingFund = new LinkedPendingAddEdit(); // any = { fundfamily: '', fundsrc: '', symbol: ''};
  pendingFundList = [];
  selectedFunds = [];
  pfListFundFamily = [];
  waitForSFList: boolean;


  loadingInfo: boolean = false;
  alertMsg: any = { show: false, msg: '' };
  custPopups: any = { linkPendingFund: false, type: '' };
  alertSubsLPF: Subscription;
  toggleSubscription: Subscription;
  filterSubscription: Subscription;
  fundParamObj = { pageNumber: -1, pageSize: 100, sortOrder: 'Desc', sortBy: 'FundName', totalRecords: 0 };

  constructor(private sharedService$: SharedService, private customerService: CustomerService, private fundService: FundService) { }

  ngOnInit() {
    this.callApi = false; // temporary fix for subscription issue
    // this.pendingFundList = this.sharedService$.getPendingFunds();
    this.toggleSubscription = this.sharedService$.togglebar.asObservable().subscribe((res: any) => {
      this.toggleState = res;
    });

    this.filterSubscription = this.sharedService$.customerPendingFundsFilter$.subscribe((result: any) => {
      // Discard the input of subscription as data is being passed as input parameter
      this.callLinkedPendingFunds();
    });

    this.alertSubsLPF = this.sharedService$.confirmationPopup$.subscribe((res: any) => {
     // console.log("fund", res);
      if (this.callApi) {
        if (res.hasOwnProperty('options') && res.options === 'close') {
          if (res.callfrom === 'pending fund' && res.type === 'link') {
            this.callApi = false;
            this.linkUpdatePendingFund();
          }
          if (res.callfrom === 'pending fund' && res.type === 'update') {
            this.callApi = false;
            this.linkUpdatePendingFund();
          }
          if (res.callfrom === 'pending fund' && res.type === 'unlink-list') {
            this.callApi = false;
            this.unlinkSelectedFunds();
          }
          if (res.callfrom === 'pending fund' && res.type === 'unlink') {
            this.callApi = false;
            this.unlinkFund();
          }
        }
      }
    });

  }

  ngOnDestroy() {
    // console.log('destroyyyy LPF')
    this.alertSubsLPF.unsubscribe();
    this.sharedService$.callConfirmPopup({});
    this.toggleSubscription.unsubscribe();
    this.filterSubscription.unsubscribe();
  }

  ngOnChanges() {
   //  console.log('changes');
    this.selectedFunds = [];
  }

  toggleFilter() {
    this.toggleState = !this.toggleState;
    this.sharedService$.toggleSideBar(this.toggleState);
  }

   /// Sort Table List according to Columns
   sortTableData(colm: string) {
    this.fundParamObj.sortBy = colm;
    if (this.fundParamObj.sortOrder === 'ASC') {
      this.fundParamObj.sortOrder = 'Desc';
    } else {
      this.fundParamObj.sortOrder = 'ASC';
    }
    this.callLinkedPendingFunds();
  }


  callLinkedPendingFunds() {
    this.loadingInfo = true;
    // const params = {
    //   customerId: this.customerId,
    //   searchtext: '',
    //   PageNumber: this.fundParamObj.pageNumber,
    //   PageSize: this.fundParamObj.pageSize,
    //   SortOrder: this.fundParamObj.sortOrder,
    //   SortBy: this.fundParamObj.sortBy,
    //   FundId: -1,
    //   TotalRecords: ''
    // };
    const params = {
      FilterModel: {
        SearchText: this.searchText,
        CustomerID: this.customerId,
        FundFamilyID: this.fundFilter && this.fundFilter.FundFamilyID ? this.fundFilter.FundFamilyID : -1,

      },
      Pager: {
        PageNumber: this.fundParamObj.pageNumber,
        PageSize: this.fundParamObj.pageSize,
        SortOrder: this.fundParamObj.sortOrder,
        SortBy: this.fundParamObj.sortBy,
        TotalRecords: 0
      }
    }

    //this.sharedService$.customerPendingFundsFilter$.subscribe(() => {

      this.customerService.getLinkedPendingFunds(params).subscribe((result: any) => {
        if (result['IsSuccess']) {
          this.pendingFundList = result['Data']['List']['Funds'];
          this.alertMsg = { show: false, msg: '' };
        } else {
          this.pendingFundList = [];
          this.alertMsg = { show: true, msg: 'No Linked Pending Funds In Selected Customer' };
        }
      }, (err: any) => {

      }, () => {
        setTimeout(() => { this.loadingInfo = false; }, 500);
      });
    //});
  }

  resetForm(actionType: string) {

    this.setFundFormDetails(actionType, Object.assign({}, this.editedFund));
  }
  
  /// Popup Code ///
  setFundFormDetails(actionType: string, fund: any) {
    if (actionType === 'new') {
      this.newPendingFund = new LinkedPendingAddEdit();
      this.getPendingFundsByFFamily();
    } else if (actionType === 'edit' && fund) {
      this.newPendingFund = fund;
      this.newPendingFund.FundId = fund.Id;
    }
    this.custPopups.type = actionType;
    this.custPopups.linkPendingFund = true;

  }

  populateFundDetails(actionType: string, fund: any) {
    this.selectedFunds = [];
    this.editedFund = Object.assign({}, fund);
    console.log(this.editedFund);
    this.setFundFormDetails(actionType, Object.assign({}, fund));
    // console.log(this.editedFund);
  }

  popupClose() {
    this.custPopups.linkPendingFund = false;
    this.custPopups.type = '';
  }

  linkUpdatePendingFund() {
    this.loadingInfo = true;
    const param = {
      CustomerID: this.customerId,
      Funds: [{
        Id: Number(this.newPendingFund.FundId),
        CustomerSymbol: this.newPendingFund.CustomerSymbol,
      }]
    };
    this.customerService.linkCustomerPendingFund(param).subscribe((res: any) => {
      if (res['IsSuccess']) {
        if (this.custPopups.type === 'edit') {
          this.sharedService$.toastMsgAlert({ options: 'alert', msg: 'Link Pending Fund Updated Successfully.' });
        } else {
          this.sharedService$.toastMsgAlert({ options: 'alert', msg: 'Link Pending Fund Linked Successfully.' });
        }
        this.newPendingFund = new LinkedPendingAddEdit();
        this.fundParamObj.pageNumber = 1;
        this.callLinkedPendingFunds();
        this.popupClose();
      }
    }, (err) => {

    }, () => {

      this.loadingInfo = false;
    });
  }

  confirmPendingFund() {
    if (this.custPopups.type === 'new') {
      this.callApi = true;
      this.sharedService$.callConfirmPopup({
        options: 'open', show: true, callfrom: 'pending fund', type: 'link',
        message: `Are you sure you want to Link this fund? click 'LINK' to add fund or 'Cancel' to discard`
      });
    } else if (this.custPopups.type === 'edit') {
      this.callApi = true;
      this.sharedService$.callConfirmPopup({
        options: 'open', show: true, callfrom: 'pending fund', type: 'update',
        message: `Are you sure you want to Update this fund? click 'Save' to update fund or 'Cancel' to discard`
      });
    }

  }

  unLinkSelectedFundsConfirmation() {
    this.callApi = true;
    this.sharedService$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'pending fund', type: 'unlink-list',
      message: `Are you sure you want to unlink selected funds? Click 'UNLINK' to unlink funds or 'Cancel' to discard`
    });
  }

  unLinkFundsConfirmation() {
    this.callApi = true;
    this.sharedService$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'pending fund', type: 'unlink',
      message: `Are you sure you want to unlink this fund? Click 'UNLINK' to unlink fund or 'Cancel' to discard`
    });

  }

  onFundFamilySelection(evtval: any) {
    if (evtval.target.value) {
      this.getPendingFundsByFFamily();
      // this.newPendingFund.FundID = '';
    }
  }


  getSelectedFundList() {
    let funds = [];
    this.selectedFunds.forEach(fund => {  funds.push(fund.Id); });
    return funds;
  }

  unlinkSelectedFunds() {
    this.unlinkPendingFund(this.getSelectedFundList());

  }

  unlinkFund() {
    let funds = [];
    console.log(this.editedFund);
    funds.push(this.editedFund.Id);
    this.unlinkPendingFund(funds);
  }


  unlinkPendingFund(funds) {
    this.loadingInfo = true;
    const params = {
      CustomerID: this.customerId,
      Funds: { StringList: funds }
    };
    this.customerService.unlinkCustPendingFund(params).subscribe((res: any) => {
      if (res['IsSuccess']) {
        this.sharedService$.toastMsgAlert({ options: 'alert', msg: 'Funds unlinked successfully.' });
        this.newPendingFund = new LinkedPendingAddEdit();
        this.popupClose();
        this.fundParamObj.pageNumber = 1;
        this.callLinkedPendingFunds();
        this.selectedFunds = [];
      }
    }, (err) => {
    }, () => {
      this.loadingInfo = false;
    });
  }

  getPendingFundsByFFamily() {
    this.waitForSFList = true;
    const param = {
      customerId: this.customerId,
      fundFamilyID: this.newPendingFund.FundFamilyId,
      TotalRecords: 0
    };
    this.customerService.getUnlinkCustomerPendingFundList(param).subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.pfListFundFamily = result['Data']['List'];
      }
    }, (err) => {
      this.waitForSFList = false;
    }, () => {
      this.waitForSFList = false;
    });
  }

  searchFunds(isSearchClicked: boolean) {
    if (isSearchClicked) {
      this.fundParamObj.pageNumber = 1
    }
    this.callLinkedPendingFunds()
  }

}
