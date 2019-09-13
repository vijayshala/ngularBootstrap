import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { PendingFundFilterModel, PagerInfo } from '../fund.models';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { FundService } from 'src/app/services/fund.service';
import { FundConstants } from 'src/app/constants/fund.constants';
import { CustomerService } from 'src/app/services/customer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-funds',
  templateUrl: './pending-funds.component.html',
  styleUrls: ['./pending-funds.component.css']
})
export class PendingFundsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() fundFamilyGUID: string;
  @Input() filterData: PendingFundFilterModel;

  mergerReasonID = this.fundConst.mergerReasonID;
  private notifyFilterSub: Subscription;
  private alertSubs: Subscription;

  searchText: string = '';
  pagerInfo = new PagerInfo();
  searchCustomerText: string = '';
  customerPagerInfo = new PagerInfo();
  popup: any = { isAddEdit: false, type: '', isJunkFund: false, customerView: false };
  alertMsg: any = { show: false, msg: '' };
  customerAlertMsg: any = { show: false, msg: '' };

  waitForMergedSourcedFundList: boolean = false;
  isCustomerSearchBtnClick: boolean;
  requiredMergedFund: boolean = false;
  loadingInfo: boolean = false;
  toggleState: boolean;

  pendingFundList: any = [];
  selectedPendingFundData: any;
  selectedPendingFundList = [];
  pendingFundCustomerList = [];
  selectedPendingFundCustomerData: any;
  pendingFundForm = new FormGroup({});
  convertToJunkFundForm = new FormGroup({});

  dropdownList = {
    dividendFrequencyList: [],
    primaryPricingSourceList: [],
    secondaryPricingSourceList: [],
    statusList: [],
    reasonList: [],
    movedFndFamilyList: [],
    mergedFundFamilyList: [],
    mergedSourcedFundList: []
  };

  constructor(private fb: FormBuilder, private sharedService: SharedService, private commonService: CommonService,
    private fundService: FundService, private customerService: CustomerService, private fundConst: FundConstants,
    private route: Router) { }

  ngOnInit() {
    this.createPendingFundForm();
    this.createConvertToJunkFundForm();

    this.sharedService.togglebar.asObservable().subscribe((res: any) => {
      this.toggleState = res;
    });

    this.alertSubs = this.sharedService.confirmationPopup$.subscribe((res: any) => {
      if (res.hasOwnProperty('options') && res.options === 'close') {
        if (res.callfrom === 'pending funds' && res.type === 'delete' && (res.deleteType === 'single' || res.deleteType === 'multiple')) {
          this.deletePendingFundInfo(res.deleteType);
        }
        if (res.callfrom === 'pending funds' && res.type === 'add') {
          this.addPendingFundInfo();
        }
        if (res.callfrom === 'pending funds' && res.type === 'update') {
          this.updatePendingFundInfo();
        }
        if (res.callfrom === 'pending to junk fund' && res.type === 'move') {
          this.convertPendingFundToJunkFund();
        }
        if (res.callfrom === 'pending to source fund' && res.type === 'move') {
          this.convertPendingFundToSourceFund();
        }
      }
    });

    this.notifyFilterSub = this.sharedService.notifyFundFilterObservable$.subscribe((res) => {
      this.getPendingFundList();
    });

    this.getDividendFrequencyList();
    this.getPricingSourceList();
    this.getStatusList();
    this.getReasonList();
    this.getMergedFundFamilyList();
    this.getMergedSourcedFundList(this.fundFamilyGUID);
  }

  ngOnDestroy() {
    this.notifyFilterSub.unsubscribe();
    this.alertSubs.unsubscribe();
  }

  ngOnChanges() {
    this.selectedPendingFundList = [];
    this.getPendingFundList();
  }

  getDividendFrequencyList() {
    this.commonService.getDividendFrequencyList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.dividendFrequencyList = result.Data;
      }
    });
  }

  getPricingSourceList() {
    this.commonService.getPricingSourceList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.primaryPricingSourceList = result.Data;
        this.dropdownList.secondaryPricingSourceList = result.Data;
      }
    });
  }

  getStatusList() {
    this.commonService.getStatusList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.statusList = result.Data;
      }
    });
  }

  getReasonList() {
    this.commonService.getReasonList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.reasonList = result.Data;
      }
    });
  }

  getMergedFundFamilyList() {
    this.commonService.getFundFamilyList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.movedFndFamilyList = result.Data;
        this.dropdownList.mergedFundFamilyList = result.Data;
      }
    });
  }

  onMergedFundFamilySelection(evt: any) {
    if (evt.target.value) {
      this.getMergedSourcedFundList(evt.target.value);
    }
  }

  getMergedSourcedFundList(fundFamilyGUID: any) {
    const params = {
      GUID: fundFamilyGUID
    };
    this.waitForMergedSourcedFundList = true;
    this.fundService.getSourcedFundListByFundFamilyId(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.mergedSourcedFundList = result.Data;
      }
    }, (err) => { }, () => {
      this.waitForMergedSourcedFundList = false;
    });
  }

  // check white space at initial
  noWhitespace(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
  }

  getPendingFundList() {
    this.loadingInfo = true;
    const params = this.getPendingFundParams('basic');
    this.fundService.getPendingFundsByFundFamilyId(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.pendingFundList = result.Data.List;
        if (this.pendingFundList.length === 0) {
          this.alertMsg = { show: true, msg: 'No pending funds in selected fund family' };
        } else {
          this.alertMsg = { show: false, msg: '' };
        }
      } else {
        this.pendingFundList = [];
        this.alertMsg = { show: true, msg: 'No pending funds in selected fund family' };
      }
      this.loadingInfo = false;
    }, (error: any) => {
      // console.log(error)
      this.pendingFundList = []; this.loadingInfo = false;
    });
  }

  createPendingFundForm() {
    this.pendingFundForm = this.fb.group({
      GUID: new FormControl(''),
      Id: new FormControl(''),
      FundName: new FormControl('', [Validators.required, Validators.maxLength(50), this.noWhitespace]),
      CUSIP: new FormControl('', [Validators.required, Validators.maxLength(9), this.noWhitespace]),
      Ticker: new FormControl('', [Validators.maxLength(5)]),
      ExtendedTicker: new FormControl({ value: '', disabled: true }, [Validators.maxLength(10)]),
      InternalNumber: new FormControl('', [Validators.maxLength(15)]),
      IsDollarFund: new FormControl(''),
      IsMilRateUsed: new FormControl(''),
      IsNavUsed: new FormControl(''),
      IsFundTrading: new FormControl(''),
      TradingStartDate: new FormControl(''),
      PrimaryPricingSourceCode: new FormControl(''),
      SecondaryPricingSourceCode: new FormControl(''),
      MovedFundFamilyGUID: new FormControl(''),
      DividendFrequencyGUID: new FormControl(''),
      StatusId: new FormControl(''),
      Comments: new FormControl('', [Validators.maxLength(50)])
    });

    this.setUserDefinedPendingFundValidations();
  }

  setUserDefinedPendingFundValidations(): void {
    this.pendingFundForm.get('Ticker').valueChanges
      .subscribe(Ticker => {
        this.setExtendedTickerValidation(Ticker);
      });
  }

  setExtendedTickerValidation(Ticker: any) {
    if (Ticker) {
      const extendedTicker = this.pendingFundForm.get('ExtendedTicker');
      if (Ticker.length < 5) {
        extendedTicker.reset();
        extendedTicker.disable();
      }
      else {
        extendedTicker.enable();
      }
    }
  }

  createConvertToJunkFundForm() {
    this.convertToJunkFundForm = this.fb.group({
      PendingFundGUID: new FormControl(''),
      PendingFundName: new FormControl(''),
      ReasonId: new FormControl('', [Validators.required]),
      ReasonComments: new FormControl('', [Validators.maxLength(70)]),
      MergedFundFamilyGUID: new FormControl({ value: '', disabled: true }),
      MergedFundGUID: new FormControl({ value: '', disabled: true }),
      HasCorporateActions: new FormControl('')
    });

    this.setUserDefinedConvertToJunkFundValidations();
  }

  setUserDefinedConvertToJunkFundValidations() {
    this.convertToJunkFundForm.get('ReasonId').valueChanges
      .subscribe(ReasonId => {
        this.setMergedFundValidation(ReasonId);
      });
  }

  setMergedFundValidation(ReasonId: any) {
    if (ReasonId) {
      const mergedFundFamilyGUID = this.convertToJunkFundForm.get('MergedFundFamilyGUID');
      const mergedFundGUID = this.convertToJunkFundForm.get('MergedFundGUID');
      if (ReasonId === this.mergerReasonID) {
        mergedFundFamilyGUID.enable();
        mergedFundGUID.enable();
        mergedFundGUID.setValidators([Validators.required]);
        this.requiredMergedFund = true;
      }
      else {
        mergedFundFamilyGUID.reset();
        this.convertToJunkFundForm.patchValue({ MergedFundFamilyGUID: this.fundFamilyGUID });
        mergedFundFamilyGUID.disable();
        mergedFundGUID.reset();
        this.convertToJunkFundForm.patchValue({ MergedFundGUID: '' });
        mergedFundGUID.disable();
        mergedFundGUID.setValidators(null);
        this.requiredMergedFund = false;
      }

      mergedFundGUID.updateValueAndValidity();
    }
  }

  fromJsonDate(jDate: any): string {
    const bDate: Date = new Date(jDate);
    return bDate.toISOString().substring(0, 10);  //Ignore time
  }

  convertDate(strDate: any) {
    var date = new Date(strDate),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear()].join("/");
  }

  onSearchPendingFundBtnClick(isSearchBtnClicked: boolean) {
    if (isSearchBtnClicked) {
      this.pagerInfo.PageNumber = 1;
    }
    this.getPendingFundList();
  }

  onDownloadPendingFundBtnClick() {
    this.loadingInfo = true;
    const params = this.getPendingFundParams('basic');
    this.fundService.downloadPendingFundDataByFundFamilyId(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        let url = result.Data;
        let pwa = window.open(url, '_self');
        if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
          this.alertMsg = { show: true, msg: 'Please disable your Pop-up blocker and try again.' };
        }
        this.loadingInfo = false;
      }
      else {
        this.alertMsg = { show: true, msg: result.Message };
      }
    }, (error: any) => {
      this.loadingInfo = false;
    });
  }

  getPendingFundParams(type: string) {
    switch (type) {
      case "basic":
        return {
          IsDollarFund: this.filterData.IsDollarFund,
          IsMilRateUsed: this.filterData.IsMilRateUsed,
          IsNAVUsed: this.filterData.IsNavUsed,
          IsFundTrading: this.filterData.IsFundTrading,
          TradingStartDate: (this.filterData.TradingStartDate === '' || this.filterData.TradingStartDate === null ? null : this.convertDate(this.filterData.TradingStartDate)),
          PricingSourceId: this.filterData.PricingSourceId,
          DividendFrequencyGUID: (this.filterData.DividendFrequencyGUID === '' ? null : this.filterData.DividendFrequencyGUID),
          StatusId: this.filterData.StatusId,
          SearchText: this.searchText,
          PageNumber: this.pagerInfo.PageNumber,
          PageSize: this.pagerInfo.PageSize,
          SortOrder: this.pagerInfo.SortOrder,
          SortBy: this.pagerInfo.SortBy,
          GUID: this.fundFamilyGUID
        };
      case "add":
      case "edit":
        return {
          GUID: (type === 'edit' ? this.pendingFundForm.value.GUID : null),
          FundName: this.pendingFundForm.value.FundName,
          CUSIP: this.pendingFundForm.value.CUSIP,
          Ticker: this.pendingFundForm.value.Ticker,
          ExtendedTicker: (this.pendingFundForm.value.ExtendedTicker === null ? '' : this.pendingFundForm.value.ExtendedTicker),
          InternalNumber: (this.pendingFundForm.value.InternalNumber === '' ? null : this.pendingFundForm.value.InternalNumber),
          IsDollarFund: (this.pendingFundForm.value.IsDollarFund === '' ? false : this.pendingFundForm.value.IsDollarFund),
          IsNavUsed: (this.pendingFundForm.value.IsNavUsed === '' ? false : this.pendingFundForm.value.IsNavUsed),
          IsMilRateUsed: (this.pendingFundForm.value.IsMilRateUsed === '' || this.pendingFundForm.value.IsMilRateUsed === undefined ? false : this.pendingFundForm.value.IsMilRateUsed),
          IsFundTrading: (this.pendingFundForm.value.IsFundTrading === '' ? false : this.pendingFundForm.value.IsFundTrading),
          TradingStartDate: (this.pendingFundForm.value.TradingStartDate === '' ? null : this.convertDate(this.pendingFundForm.value.TradingStartDate)),
          PrimaryPricingSourceCode: (this.pendingFundForm.value.PrimaryPricingSourceCode === '' ? null : this.pendingFundForm.value.PrimaryPricingSourceCode),
          SecondaryPricingSourceCode: (this.pendingFundForm.value.SecondaryPricingSourceCode === '' ? null : this.pendingFundForm.value.SecondaryPricingSourceCode),
          DividendFrequencyGUID: (this.pendingFundForm.value.DividendFrequencyGUID === '' ? null : this.pendingFundForm.value.DividendFrequencyGUID),
          StatusId: (this.pendingFundForm.value.StatusId === '' ? null : this.pendingFundForm.value.StatusId),
          Comments: (this.pendingFundForm.value.Comments === '' ? null : this.pendingFundForm.value.Comments),
          FundFamilyGUID: (this.pendingFundForm.value.MovedFundFamilyGUID === undefined ? this.fundFamilyGUID : this.pendingFundForm.value.MovedFundFamilyGUID)
        };
    }
  }

  onResetFormFieldsClick(type: string) {
    this.setPendingFundData(type, this.selectedPendingFundData);
  }

  loadPendingFundData(type: string, data: any) {
    this.selectedPendingFundList = [];
    this.setPendingFundData(type, data);
  }

  setPendingFundData(type: string, data: any) {
    this.popup = { isAddEdit: true, type: type };

    switch (type) {
      case "add": {
        this.createPendingFundForm();
        break;
      }
      case "edit": {
        this.pendingFundForm.patchValue({
          GUID: data.GUID,
          Id: data.Id,
          FundName: data.FundName,
          MovedFundFamilyGUID: (data.MovedFundFamilyGUID === null ? '' : data.MovedFundFamilyGUID),
          CUSIP: data.CUSIP,
          Ticker: data.Ticker,
          ExtendedTicker: data.ExtendedTicker,
          InternalNumber: data.InternalNumber,
          IsDollarFund: data.IsDollarFund,
          IsNavUsed: data.IsNavUsed,
          IsFundTrading: data.IsFundTrading,
          TradingStartDate: (data.TradingStartDate === '' || data.TradingStartDate === null ? null : this.convertDate(data.TradingStartDate)),
          DividendFrequencyGUID: (data.DividendFrequency.GUID === null ? '' : data.DividendFrequency.GUID),
          PrimaryPricingSourceCode: (data.PrimaryPricingSource.ID === null ? '' : data.PrimaryPricingSource.ID),
          SecondaryPricingSourceCode: (data.SecondaryPricingSource.ID === null ? '' : data.SecondaryPricingSource.ID),
          StatusId: (data.Status.ID === null ? '' : data.Status.ID),
          Comments: data.Comments,
          FundFamilyGUID: this.fundFamilyGUID
        });
        this.selectedPendingFundData = data;
        break;
      }
    }
    this.pendingFundForm.patchValue({ MovedFundFamilyGUID: this.fundFamilyGUID });
    this.setExtendedTickerValidation(data.Ticker);
  }

  popupClose() {
    this.popup = { isAddEdit: false, type: '', isJunkFund: false };
  }

  onSearchPendingFundCustomerBtnClick(isSearchBtnClicked: boolean) {
    if (isSearchBtnClicked) {
      this.isCustomerSearchBtnClick = true;
      this.customerPagerInfo.PageNumber = 1;
    }
    this.getPendingFundCustomerList(this.selectedPendingFundCustomerData);
  }

  getPendingFundCustomerList(data: any) {
    const params = {
      SearchText: this.searchCustomerText,
      PageNumber: this.customerPagerInfo.PageNumber,
      PageSize: this.customerPagerInfo.PageSize,
      SortOrder: this.customerPagerInfo.SortOrder,
      SortBy: this.customerPagerInfo.SortBy,
      GUID: data.GUID
    };
    this.customerService.getCustomersByPendingFundId(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.pendingFundCustomerList = result.Data.List;
        if (this.pendingFundCustomerList.length === 0) {
          this.customerAlertMsg = { show: true, msg: 'No customers linked to the selected pending fund' };
        }
        else {
          this.isCustomerSearchBtnClick = true;
          this.customerAlertMsg = { show: false, msg: '' };
        }
      } else {
        this.pendingFundCustomerList = [];
        this.customerAlertMsg = { show: true, msg: 'No customers linked to the selected pending fund' };
      }
    }, (error: any) => {
      // console.log(error)
      this.popup.customerView = false;
      this.isCustomerSearchBtnClick = false;
      this.pendingFundCustomerList = [];
    });
  }

  loadPendingFundCustomers(type: string, data: any) {
    switch (type) {
      case "open": {
        this.selectedPendingFundCustomerData = data;
        this.popup.customerView = true;
        this.getPendingFundCustomerList(data);
        break;
      }
      case "close": {
        this.selectedPendingFundCustomerData = null;
        this.popup.customerView = false;
        this.isCustomerSearchBtnClick = false;
        this.pendingFundCustomerList = [];
        break;
      }
    }
  }


  loadJunkFundPopup(type: string) {
    switch (type) {
      case "open": {
        this.createConvertToJunkFundForm();
        this.popup.isJunkFund = true;
        this.convertToJunkFundForm.patchValue({
          PendingFundGUID: this.selectedPendingFundData.GUID,
          PendingFundName: this.selectedPendingFundData.FundName
        });
        this.convertToJunkFundForm.patchValue({ MergedFundFamilyGUID: this.fundFamilyGUID });
        this.setMergedFundValidation(this.convertToJunkFundForm.value.ReasonId.toString());
        break;
      }
      case "close": {
        this.popup.isJunkFund = false;
        break;
      }
    }
  }

  onToggleFilterSidebarBtnClick() {
    this.toggleState = !this.toggleState;
    this.sharedService.toggleSideBar(this.toggleState);
  }

  PerformAction(purpose: string) {
    switch (purpose) {
      case "Add": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'pending funds', type: 'add',
          message: 'click "ADD" to add the pending fund or click "Cancel" to discard '
        });
        break;
      }
      case "Update": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'pending funds', type: 'update',
          message: 'click "SAVE" to save the changes or click "Cancel" to discard '
        });
        break;
      }
      case "ConvertToSource": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'pending to source fund', type: 'move',
          message: 'Are you sure to want to source this fund? Customers will automatically will be unlinked'
        });
        break;
      }
      case "ConvertToJunk": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'pending to junk fund', type: 'move',
          message: 'Are you sure to want to junk this fund? Customers will automatically will be unlinked'
        });
        break;
      }
      case "DeleteMultiple": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'pending funds', type: 'delete',
          message: 'Are you sure you want to delete selected pending funds?', deleteType: 'multiple'
        });
        break;
      }
    }
  }

  addPendingFundInfo() {
    this.loadingInfo = true;
    this.sharedService.waitingSign(true);
    const params = this.getPendingFundParams('add');
    this.fundService.addPendingFundDetails(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          this.pagerInfo.PageNumber = 1;
          this.getPendingFundList();
          this.alertMsg = { show: true, msg: 'Pending fund added successfully.' };
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Pending fund has been added successfully.' });
          this.createPendingFundForm();
          this.popupClose();
        }
        else {
          if (result.data) {
            this.getValidationMessages(result.data);
          }
          else {
            this.sharedService.toastMsgAlert({ options: 'alert', msg: result.Message });
          }
        }
      }
    }, (err) => {
      this.loadingInfo = false;
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Pending fund has not been added successfully.' });
    }, () => {
      this.loadingInfo = false;
      this.sharedService.waitingSign(false);
    });
  }

  updatePendingFundInfo() {
    this.loadingInfo = true;
    this.sharedService.waitingSign(true);
    const params = this.getPendingFundParams('edit');
    this.fundService.updatePendingFundDetails(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          //this.pagerInfo.PageNumber = 1;
          this.getPendingFundList();
          this.alertMsg = { show: true, msg: 'Pending fund updated successfully.' };
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Pending fund has been updated successfully.' });
          this.popupClose();
        }
        else {
          if (result.data) {
            this.getValidationMessages(result.data);
          }
          else {
            this.sharedService.toastMsgAlert({ options: 'alert', msg: result.Message });
          }
        }
      }
    }, (err) => {
      this.loadingInfo = false;
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Pending fund has not been updated successfully.' });
    }, () => {
      this.loadingInfo = false;
      this.sharedService.waitingSign(false);
    });
  }

  convertPendingFundToSourceFund() {
    const params = {
      GUID: this.selectedPendingFundData.GUID
    };

    this.loadingInfo = true;
    this.fundService.convertPendingFundToSourceFund(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Pending fund has been converted to sourced fund successfully.' });
          this.popupClose();
          this.pagerInfo.PageNumber = 1;
          this.getPendingFundList();
        } else {
          if (result.data) {
            this.getValidationMessages(result.data);
          }
          else {
            this.sharedService.toastMsgAlert({ options: 'alert', msg: result.Message });
          }
        }
      }
      this.loadingInfo = false;
    }, (err: any) => {
      this.loadingInfo = false;
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to convert pending fund' });
    });
  }

  convertPendingFundToJunkFund() {
    const params = {
      FundGUID: this.convertToJunkFundForm.value.PendingFundGUID,
      ReasonId: this.convertToJunkFundForm.value.ReasonId,
      ReasonComments: this.convertToJunkFundForm.value.ReasonComments,
      MergedFundFamilyGUID: (this.convertToJunkFundForm.value.MergedFundFamilyGUID === '' ? null : this.convertToJunkFundForm.value.MergedFundFamilyGUID),
      MergedFundGUID: (this.convertToJunkFundForm.value.MergedFundGUID === '' ? null : this.convertToJunkFundForm.value.MergedFundGUID)
    };

    this.loadingInfo = true;
    this.fundService.convertPendingFundToJunkFund(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Pending fund has been converted to junk fund successfully.' });
          this.popupClose();
          this.pagerInfo.PageNumber = 1;
          this.getPendingFundList();
        } else {
          if (result.data) {
            this.getValidationMessages(result.data);
          }
          else {
            this.sharedService.toastMsgAlert({ options: 'alert', msg: result.Message });
          }
        }
      }
      this.loadingInfo = false;
    }, (err: any) => {
      this.loadingInfo = false;
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to convert pending fund' });
    });
  }

  deletePendingFundInfo(type: string) {
    const params = {
      GUID: []
    };
    if (type === 'single') {
      params.GUID.push(this.pendingFundForm.value.GUID);
    } else {
      this.selectedPendingFundList.forEach(childObj => params.GUID.push(childObj.GUID));
    }

    this.loadingInfo = true;
    this.fundService.deletePendingFundDetailsByIds(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Pending fund has been deleted successfully.' });
          this.popupClose();
          this.pagerInfo.PageNumber = 1;
          this.getPendingFundList();
          this.selectedPendingFundList = (type === 'multiple' ? [] : this.selectedPendingFundList);
        } else {
          if (result.data) {
            this.getValidationMessages(result.data);
          }
          else {
            this.sharedService.toastMsgAlert({ options: 'alert', msg: result.Message });
          }
        }
      }
      this.loadingInfo = false;
    }, (err: any) => {
      this.loadingInfo = false;
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to delete pending fund' });
    });
  }

  getValidationMessages(value: any) {
    if (value instanceof Array) {
      value.forEach(function (item) {
        if (typeof item !== 'string') {
          this.sharedService.toastMsgAlert({ options: 'alert', msg: item.Message });
        }
      });
    }
  }

  /// Route to customer page to specific customer //
  gotoCustomer(customerName: string) {
    this.route.navigate(['/dashboard/customers', customerName ]);
  }



}
