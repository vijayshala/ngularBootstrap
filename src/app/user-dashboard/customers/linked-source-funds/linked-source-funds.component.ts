import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription, Subscribable } from 'rxjs';
import { SourceFundAddEdit, TableParams, CustomerServices } from '../customer.model';
import { CustomerService } from 'src/app/services/customer.service';
import { FundService } from 'src/app/services/fund.service';

@Component({
  selector: 'app-linked-source-funds',
  templateUrl: './linked-source-funds.component.html',
  styleUrls: ['./linked-source-funds.component.css']
})
export class LinkedSourceFundsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() customerId: number;
  @Input() ffamilyList: Array<any>;
  @Input() selectedCustomer: any;
  @Input() fundFilter: any;
  callApi: boolean;  // temporary fix for duplicate subscription
  sourceFundList = [];
  searchText: string = "";
  editedFund: any;
  selectedFunds = [];
  toggleState: boolean;
  sfListByFF = [];

  custPopups: any = { addSourceFundLink: false, type: '' };
  loadingInfo: boolean;
  newLinkSrcFund = new SourceFundAddEdit();
  toggleSubscription: Subscription;
  alertSubLSF: Subscription;
  filterSubscription: Subscription;
  alertMsg: any = { show: false, msg: '' };
  fundParamObj = { pageNumber: -1, pageSize: 1000, sortOrder: 'Desc', sortBy: 'FundName', totalRecords: 0 };
  waitForSFList: boolean;

  constructor(private sharedService$: SharedService, private customerService: CustomerService, private fundService: FundService) { }

  ngOnInit() {

    // this.sourceFundList = this.sharedService.getSourceFunds();
    this.toggleSubscription = this.sharedService$.togglebar.asObservable().subscribe((res: any) => {
      this.toggleState = res;
    });

    this.filterSubscription = this.sharedService$.customerSourceFundsFilter$.subscribe((result: any) => {
      // Discard the input of subscription as data is being passed as input parameter
        this.callLinkedSourceFunds();
    });

    this.alertSubLSF = this.sharedService$.confirmationPopup$.subscribe((res: any) => {
      // console.log('LSPPPFFF', res)
      if (res.hasOwnProperty('options') && res.options === 'close' && res.callfrom === 'source fund') {
        if (res.callfrom === 'source fund' && res.type === 'link') {
          this.callApi = false;
          this.createSourceFundLinking();
        }
        if (res.callfrom === 'source fund' && res.type === 'unlink') {
          this.callApi = false;
          this.unlinkFund();
        }
        if (res.callfrom === 'source fund' && res.type === 'unlink-list') {
          this.callApi = false;
          this.unlinkSelectedFunds();
        }
        if (res.callfrom === 'source fund' && res.type === 'update') {
          this.callApi = false;
          this.createSourceFundLinking();
        }
      }
    });

  }

  ngOnDestroy() {
    this.sharedService$.callConfirmPopup({});
    this.filterSubscription.unsubscribe();
    this.toggleSubscription.unsubscribe();
    this.alertSubLSF.unsubscribe();
  }

  ngOnChanges() {
    this.selectedFunds = [];
    // console.log('cghahhshhs')
    // this.callLinkedSourceFunds();
  }

  setFundFormDetails(actionType: string, fund: any) {
    fund = Object.assign({}, fund);
    if (actionType === 'new') {
      let subscribedServices = this.selectedCustomer.SubscribedServices;
      this.newLinkSrcFund = new SourceFundAddEdit();

      this.newLinkSrcFund.nav = subscribedServices.includes(CustomerServices.NAV);
      this.newLinkSrcFund.mil = subscribedServices.includes(CustomerServices.MilRate);
      this.newLinkSrcFund.distributor = subscribedServices.includes(CustomerServices.Distribution);

      this.custPopups.addSourceFundLink = true;
      this.custPopups.type = actionType;
      this.getSourceFundsByFFamily();
    } else if (actionType === 'edit' && fund) {

      this.newLinkSrcFund = {
        customerId: this.customerId,
        fundfamily: fund.FundFamilyName,
        fundFamilyId: fund.FundFamilyID,
        fundsrc: fund.FundName,
        fundId: fund.Id,
        symbol: fund.CustomerSymbol,
        nav: fund.IsNAVProvided,
        mil: fund.IsMilRateProvided,
        distributor: fund.IsDistributionProvided
      };
      // this.newLinkSrcFund.fundFamilyId = this.ffamilyList.filter((ff: any) => data.FundFamily === ff.DisplayText)[0].Id;
      this.custPopups.type = actionType;
      this.custPopups.addSourceFundLink = true;
    }
  }


  populateFundDetails(actionType: string, fund: any) {
    this.selectedFunds = [];
    this.setFundFormDetails(actionType, fund);
    this.editedFund = fund;
  }

  /// Sort Table List according to Columns
  sortTableData(colm: string) {
    this.fundParamObj.sortBy = colm;
    if (this.fundParamObj.sortOrder === 'ASC') {
      this.fundParamObj.sortOrder = 'Desc';
    } else {
      this.fundParamObj.sortOrder = 'ASC';
    }
    this.callLinkedSourceFunds();
  }


  callLinkedSourceFunds() {

    this.loadingInfo = true;
    const params = {
      FilterModel: {
        SearchText: this.searchText,
        CustomerID: this.customerId,
        FundFamilyID: this.fundFilter && this.fundFilter.FundFamilyID ? this.fundFilter.FundFamilyID : -1,
        IsNAVProvided: this.fundFilter && this.fundFilter.IsNav ? this.fundFilter.IsNav : -2,
        IsMilProvided: this.fundFilter && this.fundFilter.IsMil ? this.fundFilter.IsMil : -2,
        IsDistributionProvided: this.fundFilter && this.fundFilter.IsDistribution ? this.fundFilter.IsDistribution : -2,
      },
      Pager: {
        PageNumber: this.fundParamObj.pageNumber,
        PageSize: this.fundParamObj.pageSize,
        SortOrder: this.fundParamObj.sortOrder,
        SortBy: this.fundParamObj.sortBy,
        TotalRecords: 0
      }
    };

    this.customerService.getLinkedSourceFunds(params).subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.sourceFundList = result['Data']['List']['Funds'];
        // console.log(result['Data']['List'])
        // this.fundParamObj.totalRecords = result['Data']['TotalRecords'];
        this.alertMsg = { show: false, msg: '' };
      } else {
        this.sourceFundList = [];
        this.alertMsg = { show: true, msg: 'No Linked Source Funds In Selected Customer' };
      }
    }, (err: any) => {
    }, () => {
      setTimeout(() => { this.loadingInfo = false; }, 500);
    });
  }

  loadTableDataLazy() {

  }

  popupClose(p: string) {
    this.newLinkSrcFund = new SourceFundAddEdit();
    this.custPopups.addSourceFundLink = false;
    this.custPopups.type = '';
  }

  toggleFilter() {
    this.toggleState = !this.toggleState;
    this.sharedService$.toggleSideBar(this.toggleState);
  }

  resetForm(actionType: string) {
    this.setFundFormDetails(actionType, this.editedFund);
  }

  unLinkSelectedFundsConfirmation() {
    this.callApi = true;
    this.sharedService$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'source fund', type: 'unlink-list', customHeader: 'unlink funds',
      message: `Are you sure you want to unlink selected funds? click 'UNLINK' to unlink funds or 'Cancel' to discard`
    });
  }

  linkFundConfirmation() {
    this.callApi = true;
    this.sharedService$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'source fund', type: 'link',
      message: `Are you sure you want to link this fund? click 'LINK' to link fund or 'Cancel' to discard`
    });
  }

  updateFundConfirmation() {
    this.callApi = true;
    this.sharedService$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'source fund', type: 'update',
      message: `Are you sure you want to update this fund? click 'SAVE' to link fund or 'Cancel' to discard`
    });
  }

  unlinkFundConfirmation() {
    this.callApi = true;
    this.sharedService$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'source fund', type: 'unlink',
      message: `Are you sure you want to unlink this fund? click 'UNLINK' to unlink fund or 'Cancel' to discard`
    });
  }


  createSourceFundLinking() {
    this.loadingInfo = true;
    const params = {
      CustomerID: this.customerId,
      Funds: [{
        Id: Number(this.newLinkSrcFund.fundId),
        CustomerSymbol: this.newLinkSrcFund.symbol,
        IsNAVProvided: (this.newLinkSrcFund.nav ? -1 : 0),
        IsMilRateProvided: (this.newLinkSrcFund.mil ? -1 : 0),
        IsDistributionProvided: (this.newLinkSrcFund.distributor ? -1 : 0)
      }]
    };
    this.customerService.linkCustomerSourceFund(params).subscribe((res: any) => {
      if (res['IsSuccess']) {
        if (this.custPopups.type === 'edit') {
          this.sharedService$.toastMsgAlert({ options: 'alert', msg: 'Linked Source Fund Updated Successfully.' });
        } else {
          this.sharedService$.toastMsgAlert({ options: 'alert', msg: 'Linked Source Fund Linked Successfully.' });
        }
        this.newLinkSrcFund = new SourceFundAddEdit();
        this.popupClose('s');
        this.fundParamObj.pageNumber = 1;
        this.callLinkedSourceFunds();
      }
    }, (err) => {
      this.sharedService$.toastMsgAlert({ options: 'alert', msg: err.Message });
    }, () => {
      this.loadingInfo = false;
    });
  }

  getSelectedFundList() {
    let funds = [];
    this.selectedFunds.forEach(fund => {
      funds.push(fund.Id);
    });
    return funds;
  }

  unlinkSelectedFunds() {
    this.unlinkSourceFund(this.getSelectedFundList());

  }
  unlinkFund() {
    let funds = [];
    funds.push(this.editedFund.Id);
    this.unlinkSourceFund(funds);
  }

  unlinkSourceFund(funds) {
    this.loadingInfo = true;
    const params = {
      CustomerID: this.customerId,
      Funds: { StringList: funds }
    };
    this.customerService.unlinkCustSourceFund(params).subscribe((res: any) => {
      if (res['IsSuccess']) {
        this.sharedService$.toastMsgAlert({ options: 'alert', msg: 'Linked Source Fund unLinking Successfully.' });
        this.newLinkSrcFund = new SourceFundAddEdit();
        this.popupClose('s');
        this.fundParamObj.pageNumber = 1;
        this.callLinkedSourceFunds();
        this.selectedFunds = [];
      }
    }, (err) => {
    }, () => {
      this.loadingInfo = false;
    });
  }

  onFundFamilySelection(evtval: any) {
    if (evtval.target.value) {
      this.getSourceFundsByFFamily();
      this.newLinkSrcFund.fundId = "";
    }
  }


  getSourceFundsByFFamily() {
    this.waitForSFList = true;
    const param = {
      customerId: this.customerId,
      fundFamilyID: this.newLinkSrcFund.fundFamilyId,
      TotalRecords: 0
    }; // {GUID: id};
    this.customerService.getUnlinkCustomerSourceFundList(param).subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.sfListByFF = result['Data']['List'];
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
    this.callLinkedSourceFunds()
  }


}
