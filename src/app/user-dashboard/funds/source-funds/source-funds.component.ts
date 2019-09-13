import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { SourcedFundFilterModel, PagerInfo } from '../fund.models';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { FundService } from 'src/app/services/fund.service';
import { FundConstants } from 'src/app/constants/fund.constants';
import { CustomerService } from 'src/app/services/customer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-source-funds',
  templateUrl: './source-funds.component.html',
  styleUrls: ['./source-funds.component.css']
})
export class SourceFundsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() fundFamilyGUID: string;
  @Input() filterData: SourcedFundFilterModel;

  mergerReasonID = this.fundconst.mergerReasonID;
  private notifyFilterSub: Subscription;
  private alertSubs: Subscription;


  searchText: string = '';
  pagerInfo = new PagerInfo();
  searchCustomerText: string = '';
  customerPagerInfo = new PagerInfo();
  popup: any = { isAddEdit: false, type: '', isJunkFund: false, customerView: false };
  alertMsg: any = { show: false, msg: '' };
  customerAlertMsg: any = { show: false, msg: '' };

  isCustomerSearchBtnClick: boolean = false;
  waitForMergedSourcedFundList: boolean;
  requiredMergedFund: boolean = false;
  loadingInfo: boolean = false;
  toggleState: boolean;

  sourcedFundList: any = [];
  selectedSourcedFundData: any;
  selectedSourcedFundList = [];
  sourcedFundCustomerList = [];
  selectedSourcedFundCustomerData: any;
  sourcedFundForm = new FormGroup({});
  convertToJunkFundForm = new FormGroup({});

  dropdownList = {
    dividendFrequencyList: [],
    shareClassList: [],
    omnibusTypeList: [],
    reasonList: [],
    mergedFundFamilyList: [],
    mergedSourcedFundList: []
  };

  constructor(private fb: FormBuilder, private sharedService: SharedService, private commonService: CommonService,
    private fundService: FundService, private customerService: CustomerService, private fundconst: FundConstants,
    private route: Router
    ) { }

  ngOnInit() {
    this.createSourcedFundForm();
    this.createConvertToJunkFundForm();

    this.alertSubs = this.sharedService.confirmationPopup$.subscribe((res: any) => {
      if (res.hasOwnProperty('options') && res.options === 'close') {
        if (res.callfrom === 'sourced fund' && res.type === 'delete' && (res.deleteType === 'single' || res.deleteType === 'multiple')) {
          // this.deleteSourcedFundInfo(res.deleteType);
        }
        if (res.callfrom === 'sourced fund' && res.type === 'add') {
          this.addSourcedFundInfo();
        }
        if (res.callfrom === 'sourced fund' && res.type === 'update') {
          this.updateSourcedFundInfo();
        }
        if (res.callfrom === 'sourced to junk fund' && res.type === 'move') {
          this.convertSourcedFundToJunkFund();
        }
      }
    });

    this.notifyFilterSub = this.sharedService.notifyFundFilterObservable$.subscribe((res) => {
      this.getSourcedFundList();
    });

    this.getDividendFrequencyList();
    this.getShareClassList();
    this.getOmnibusTypeList();
    this.getReasonList();
    this.getMergedFundFamilyList();
    this.getMergedSourcedFundList(this.fundFamilyGUID);
  }

  ngOnDestroy() {
    this.notifyFilterSub.unsubscribe();
    this.alertSubs.unsubscribe();
  }

  ngOnChanges() {
    this.selectedSourcedFundList = [];
    this.getSourcedFundList();
  }

  createSourcedFundForm() {
    this.sourcedFundForm = this.fb.group({
      GUID: new FormControl(''),
      Id: new FormControl(''),
      FundName: new FormControl('', [Validators.required, Validators.maxLength(50), this.noWhitespace]),
      CUSIP: new FormControl('', [Validators.required, Validators.maxLength(9), this.noWhitespace]),
      Ticker: new FormControl('', [Validators.maxLength(5)]),
      ExtendedTicker: new FormControl({ value: '', disabled: true }, [Validators.maxLength(10)]),
      InternalNumber: new FormControl('', [Validators.maxLength(15)]),
      IsDollarFund: new FormControl(''),
      IsNavUsed: new FormControl(''),
      DividendFrequencyGUID: new FormControl('', [Validators.required]),
      ShareClassGUID: new FormControl(''),
      OmnibusTypeGUID: new FormControl(''),
      Comments: new FormControl('', [Validators.maxLength(50)]),
      HasCorporateActions: new FormControl('')
    });

    this.setUserDefinedSourcedFundValidations();
  }

  setUserDefinedSourcedFundValidations(): void {
    this.sourcedFundForm.get('Ticker').valueChanges
      .subscribe(Ticker => {
        this.setExtendedTickerValidation(Ticker);
      });
  }

  setExtendedTickerValidation(Ticker: any) {
    if (Ticker) {
      const extendedTicker = this.sourcedFundForm.get('ExtendedTicker');
      if (Ticker.length < 5) {
        extendedTicker.reset();
        extendedTicker.disable();
      }
      else {
        extendedTicker.enable();
      }
    }
  }

  // check white space at initial
  noWhitespace(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
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

  getSourcedFundList() {
    this.loadingInfo = true;
    const params = this.getSourcedFundParams('basic');
    this.fundService.getSourcedFundsByFundFamilyId(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.sourcedFundList = result.Data.List;
        if (this.sourcedFundList.length === 0) {
          this.alertMsg = { show: true, msg: 'No sourced funds in selected fund family' };
        }
        else {
          this.alertMsg = { show: false, msg: '' };
        }
      } else {
        this.sourcedFundList = [];
        this.alertMsg = { show: true, msg: 'No sourced funds in selected fund family' };
      }
      this.loadingInfo = false;
    }, (error: any) => {
      // console.log(error)
      this.sourcedFundList = []; this.loadingInfo = false;
    });
  }

  getSourcedFundParams(type: string) {
    switch (type) {
      case "basic":
        return {
          IsDollarFund: this.filterData.IsDollarFund,
          IsNavUsed: this.filterData.IsNavUsed,
          ShareClassGUID: (this.filterData.ShareClassGUID === '' ? null : this.filterData.ShareClassGUID),
          OmnibusTypeGUID: (this.filterData.OmnibusTypeGUID === '' ? null : this.filterData.OmnibusTypeGUID),
          DividendFrequencyGUID: (this.filterData.DividendFrequencyGUID === '' ? null : this.filterData.DividendFrequencyGUID),
          HasCorporateAction: this.filterData.HasCorporateAction,
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
          GUID: (type === 'edit' ? this.sourcedFundForm.value.GUID : null),
          FundName: this.sourcedFundForm.value.FundName,
          CUSIP: this.sourcedFundForm.value.CUSIP,
          Ticker: this.sourcedFundForm.value.Ticker,
          ExtendedTicker: (this.sourcedFundForm.value.ExtendedTicker === null ? '' : this.sourcedFundForm.value.ExtendedTicker),
          InternalNumber: (this.sourcedFundForm.value.InternalNumber === '' ? null : this.sourcedFundForm.value.InternalNumber),
          IsDollarFund: (this.sourcedFundForm.value.IsDollarFund === '' ? false : this.sourcedFundForm.value.IsDollarFund),
          IsNavUsed: (this.sourcedFundForm.value.IsNavUsed === '' ? false : this.sourcedFundForm.value.IsNavUsed),
          DividendFrequencyGUID: (this.sourcedFundForm.value.DividendFrequencyGUID === '' ? null : this.sourcedFundForm.value.DividendFrequencyGUID),
          ShareClassGUID: (this.sourcedFundForm.value.ShareClassGUID === '' ? null : this.sourcedFundForm.value.ShareClassGUID),
          OmnibusTypeGUID: (this.sourcedFundForm.value.OmnibusTypeGUID === '' ? null : this.sourcedFundForm.value.OmnibusTypeGUID),
          Comments: (this.sourcedFundForm.value.Comments === '' ? null : this.sourcedFundForm.value.Comments),
          HasCorporateActions: this.sourcedFundForm.value.HasCorporateActions,
          FundFamilyGUID: this.fundFamilyGUID
        };
    }
  }

  onSearchSourcedFundBtnClick(isSearchBtnClicked: boolean) {
    if (isSearchBtnClicked) {
      this.pagerInfo.PageNumber = 1;
    }
    this.getSourcedFundList();
  }

  onDownloadSourcedFundBtnClick() {
    this.loadingInfo = true;
    const params = this.getSourcedFundParams('basic');
    this.fundService.downloadSourcedFundDataByFundFamilyId(params).subscribe((result: any) => {
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

  onResetFormFieldsClick(type: string) {
    this.setSourcedFundData(type, this.selectedSourcedFundData);
  }

  loadSourcedFundData(type: string, data: any) {
    this.selectedSourcedFundList = [];
    this.setSourcedFundData(type, data);
  }

  setSourcedFundData(type: string, data: any) {
    this.popup = { isAddEdit: true, type: type };

    switch (type) {
      case "add": {
        this.createSourcedFundForm();
        break;
      }
      case "edit": {
        this.sourcedFundForm.patchValue({
          GUID: data.GUID,
          Id: data.Id,
          FundName: data.FundName,
          CUSIP: data.CUSIP,
          Ticker: data.Ticker,
          ExtendedTicker: data.ExtendedTicker,
          InternalNumber: data.InternalNumber,
          IsDollarFund: data.IsDollarFund,
          IsNavUsed: data.IsNavUsed,
          DividendFrequencyGUID: (data.DividendFrequency.GUID === null ? '' : data.DividendFrequency.GUID),
          ShareClassGUID: (data.ShareClass.GUID === null ? '' : data.ShareClass.GUID),
          OmnibusTypeGUID: (data.OmnibusType.GUID === null ? '' : data.OmnibusType.GUID),
          HasCorporateActions: (data.HasCorporateActions === '' ? null : data.HasCorporateActions),
          Comments: data.Comments
        });
        this.selectedSourcedFundData = data;
        break;
      }
    }
    this.sourcedFundForm.patchValue({ MovedFundFamilyGUID: this.fundFamilyGUID });
    this.setExtendedTickerValidation(data.Ticker);
  }

  loadJunkFundPopup(type: string) {
    switch (type) {
      case "open": {
        this.createConvertToJunkFundForm();
        this.popup.isJunkFund = true;
        this.convertToJunkFundForm.patchValue({
          PendingFundGUID: this.selectedSourcedFundData.GUID,
          PendingFundName: this.selectedSourcedFundData.FundName
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

  /// Side filter toggle
  onToggleFilterSidebarBtnClick() {
    this.toggleState = !this.toggleState;
    this.sharedService.toggleSideBar(this.toggleState);
  }

  // close add/edit popup //
  popupClose() {
    this.popup.isAddEdit = false; this.popup.type = '';
  }

  getDividendFrequencyList() {
    this.commonService.getDividendFrequencyList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.dividendFrequencyList = result.Data;
      }
    });
  }

  getShareClassList() {
    this.commonService.getShareClassList(0).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.shareClassList = result.Data;
      }
    });
  }

  getOmnibusTypeList() {
    const params = {
      GUID: this.fundFamilyGUID
    };
    this.commonService.getOmnibusTypeListByFamilyId(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.omnibusTypeList = result.Data;
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
        this.dropdownList.mergedFundFamilyList = result.Data;
      }
    });
  }

  onMergedFundFamilySelection(evt: any) {
    // console.log(evt, evt.target.value)
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

  onSearchSourcedFundCustomerBtnClick(isSearchBtnClicked: boolean) {
    if (isSearchBtnClicked) {
      this.isCustomerSearchBtnClick = true;
      this.customerPagerInfo.PageNumber = 1;
    }
    this.getSourcedFundCustomerList(this.selectedSourcedFundCustomerData);
  }

  getSourcedFundCustomerList(data: any) {
    const params = {
      SearchText: this.searchCustomerText,
      PageNumber: this.customerPagerInfo.PageNumber,
      PageSize: this.customerPagerInfo.PageSize,
      SortOrder: this.customerPagerInfo.SortOrder,
      SortBy: this.customerPagerInfo.SortBy,
      GUID: data.GUID
    };
    this.customerService.getCustomersBySourcedFundId(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.sourcedFundCustomerList = result.Data.List;
        if (this.sourcedFundCustomerList.length === 0) {
          this.customerAlertMsg = { show: true, msg: 'No customers linked to the selected sourced fund' };
        }
        else {
          this.isCustomerSearchBtnClick = true;
          this.customerAlertMsg = { show: false, msg: '' };
        }
      } else {
        this.sourcedFundCustomerList = [];
        this.customerAlertMsg = { show: true, msg: 'No customers linked to the selected sourced fund' };
      }
    }, (error: any) => {
      // console.log(error)
      this.popup.customerView = false;
      this.isCustomerSearchBtnClick = false;
      this.sourcedFundCustomerList = [];
    });
  }

  loadSourcedFundCustomers(type: string, data: any) {
    switch (type) {
      case "open": {
        this.selectedSourcedFundCustomerData = data;
        this.popup.customerView = true;
        this.getSourcedFundCustomerList(data);
        break;
      }
      case "close": {
        this.searchCustomerText = '';
        this.selectedSourcedFundCustomerData = null;
        this.popup.customerView = false;
        this.isCustomerSearchBtnClick = false;
        this.sourcedFundCustomerList = [];
        break;
      }
    }
  }

  PerformAction(purpose: string) {
    switch (purpose) {
      case "Add": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'sourced fund', type: 'add',
          message: 'click "ADD" to add the sourced fund or click "Cancel" to discard '
        });
        break;
      }
      case "Update": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'sourced fund', type: 'update',
          message: 'click "SAVE" to save the changes or click "Cancel" to discard '
        });
        break;
      }
      case "ConvertToJunk": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'sourced to junk fund', type: 'move',
          message: 'Are you sure to want to JUNK this fund? Customers will automatically will be unlinked'
        });
        break;
      }
      case "DeleteMultiple": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'sourced funds', type: 'delete',
          message: 'Are you sure you want to delete selected sourced funds?', deleteType: 'multiple'
        });
        break;
      }
    }
  }

  addSourcedFundInfo() {
    this.loadingInfo = true;
    this.sharedService.waitingSign(true);
    const params = this.getSourcedFundParams('add');
    this.fundService.addSourcedFundDetails(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          this.pagerInfo.PageNumber = 1;
          this.getSourcedFundList();
          this.alertMsg = { show: true, msg: 'Sourced fund added successfully.' };
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Sourced fund has been added successfully.' });
          this.createSourcedFundForm();
          this.popupClose();
        } else {
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
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Sourced fund has not been added successfully.' });
    }, () => {
      this.loadingInfo = false;
      this.sharedService.waitingSign(false);
    });
  }

  updateSourcedFundInfo() {
    this.loadingInfo = true;
    this.sharedService.waitingSign(true);
    const params = this.getSourcedFundParams('edit');
    this.fundService.updateSourcedFundDetails(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          //this.pagerInfo.PageNumber = 1;
          this.getSourcedFundList();
          this.alertMsg = { show: true, msg: 'Sourced fund updated successfully.' };
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Sourced fund has been updated successfully.' });
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
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Sourced fund has not been updated successfully.' });
    }, () => {
      this.loadingInfo = false;
      this.sharedService.waitingSign(false);
    });
  }

  convertSourcedFundToJunkFund() {
    const params = {
      FundGUID: this.convertToJunkFundForm.value.PendingFundGUID,
      ReasonId: this.convertToJunkFundForm.value.ReasonId,
      ReasonComments: this.convertToJunkFundForm.value.ReasonComments,
      MergedFundFamilyGUID: (this.convertToJunkFundForm.value.MergedFundFamilyGUID === '' ? null : this.convertToJunkFundForm.value.MergedFundFamilyGUID),
      MergedFundGUID: (this.convertToJunkFundForm.value.MergedFundGUID === '' ? null : this.convertToJunkFundForm.value.MergedFundGUID)
    };

    this.loadingInfo = true;
    this.fundService.convertSourcedFundToJunkFund(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Sourced fund has been converted to junk fund successfully.' });
          this.popupClose();
          this.pagerInfo.PageNumber = 1;
          this.getSourcedFundList();
        } else {
          if (result.data) {
            this.getValidationMessages(result.data);
          } else {
            this.sharedService.toastMsgAlert({ options: 'alert', msg: result.Message });
          }
        }
      }
      this.loadingInfo = false;
    }, (err: any) => {
      this.loadingInfo = false;
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to convert sourced fund' });
    });
  }

  // deleteSourcedFundInfo(type: string) {
  //   const params = {
  //     GUID: []
  //   };
  //   if (type === 'single') {
  //     params.GUID.push(this.sourcedFundForm.value.GUID);
  //   } else {
  //     this.selectedSourcedFundList.forEach(childObj => params.GUID.push(childObj.GUID));
  //   }

  //   this.loadingInfo = true;
  //   this.fundService.deleteSourcedFundDetailsByIds(params).subscribe((result: any) => {
  //     if (result) {
  //       if (result.IsSuccess) {
  //         this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Pending fund has been deleted successfully.' });
  //         this.popupClose();
  //         this.pagerInfo.PageNumber = 1;
  //         this.getSourcedFundList();
  //         this.selectedSourcedFundList = (type === 'multiple' ? [] : this.selectedSourcedFundList);
  //       } else {
  //         if (result.data) {
  //           this.getValidationMessages(result.data);
  //         }
  //         else {
  //           this.sharedService.toastMsgAlert({ options: 'alert', msg: result.Message });
  //         }
  //       }
  //     }
  //     this.loadingInfo = false;
  //   }, (err: any) => {
  //     this.loadingInfo = false;
  //     this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to delete pending fund' });
  //   });
  // }

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
