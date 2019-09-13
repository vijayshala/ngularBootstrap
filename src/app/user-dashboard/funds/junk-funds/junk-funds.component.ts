import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { FundService } from 'src/app/services/fund.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { JunkFundFilterModel, PagerInfo } from '../fund.models';
import { CommonService } from 'src/app/services/common.service';
import { FundConstants } from 'src/app/constants/fund.constants';

@Component({
  selector: 'app-junk-funds',
  templateUrl: './junk-funds.component.html',
  styleUrls: ['./junk-funds.component.css']
})
export class JunkFundsComponent implements OnInit, OnChanges {
  @Input() fundFamilyGUID: string;
  @Input() filterData: JunkFundFilterModel;

  mergerReasonID = this.fundconst.mergerReasonID;
  private notifyFilterSub: Subscription;
  private alertSubs: Subscription;

  searchText: string = '';
  pagerInfo = new PagerInfo();
  popup: any = { isAddEdit: false, type: '' };
  alertMsg: any = { show: false, msg: '' };

  loadingInfo: boolean = false;
  toggleState: boolean;
  waitForMergedSourcedFundList: boolean;
  requiredMergedFund: boolean = false;

  junkFundList: any = [];
  selectedJunkFundData: any;
  selectedJunkFundList = [];
  junkFundForm = new FormGroup({});

  dropdownList = {
    reasonList: [],
    mergedFndFamilyList: [],
    mergedSourcedFundList: []
  };

  constructor(private fb: FormBuilder, private sharedService: SharedService, private commonService: CommonService,
    private fundService: FundService, private fundconst: FundConstants) { }

  ngOnInit() {
    this.createJunkFundForm();

    this.alertSubs = this.sharedService.confirmationPopup$.subscribe((res: any) => {
      if (res.hasOwnProperty('options') && res.options === 'close') {
        if (res.callfrom === 'junk fund' && res.type === 'add') {
          this.addJunkFundInfo();
        }
        if (res.callfrom === 'junk fund' && res.type === 'update') {
          this.updateJunkFundInfo();
        }
        if (res.callfrom === 'junk fund' && res.type === 'delete' && (res.deleteType === 'single' || res.deleteType === 'multiple')) {
          this.deleteJunkFundInfo(res.deleteType);
        }
      }
    });

    this.notifyFilterSub = this.sharedService.notifyFundFilterObservable$.subscribe((res) => {
      this.getJunkFundList();
    });

    this.getReasonList();
    this.getMergedFundFamilyList();
    this.getMergedSourcedFundList(this.fundFamilyGUID);
  }

  ngOnDestroy() {
    this.notifyFilterSub.unsubscribe();
    this.alertSubs.unsubscribe();
  }

  ngOnChanges() {
    this.selectedJunkFundList = [];
    this.getJunkFundList();
  }

  // check white space at initial
  noWhitespace(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
  }

  createJunkFundForm() {
    this.junkFundForm = this.fb.group({
      GUID: new FormControl(''),
      Id: new FormControl(''),
      FundName: new FormControl('', [Validators.required, Validators.maxLength(50), this.noWhitespace]),
      CUSIP: new FormControl('', [Validators.required, Validators.maxLength(9), this.noWhitespace]),
      Ticker: new FormControl('', [Validators.maxLength(5)]),
      ExtendedTicker: new FormControl({ value: '', disabled: true }, [Validators.maxLength(10)]),
      InternalNumber: new FormControl('', [Validators.maxLength(15)]),
      ReasonId: new FormControl('', [Validators.required]),
      Reason: new FormControl(''),
      ReasonComments: new FormControl('', [Validators.maxLength(70)]),
      MergedFundFamilyGUID: new FormControl({ value: '', disabled: true }),
      MergedFundFamilyName: new FormControl(''),
      MergedFundGUID: new FormControl({ value: '', disabled: true }),
      MergedFundName: new FormControl(''),
      Comments: new FormControl('', [Validators.maxLength(50)]),
      FundFamilyGUID: new FormControl('')
    });

    this.setUserDefinedValidations();
  }

  setUserDefinedValidations(): void {
    this.junkFundForm.get('ReasonId').valueChanges
      .subscribe(ReasonId => {
        this.setMergedFundValidation(ReasonId);
      });

    this.junkFundForm.get('Ticker').valueChanges
      .subscribe(Ticker => {
        this.setExtendedTickerValidation(Ticker);
      });
  }

  setMergedFundValidation(ReasonId: any) {
    if (ReasonId) {
      const mergedFundFamilyGUID = this.junkFundForm.get('MergedFundFamilyGUID');
      const mergedFundGUID = this.junkFundForm.get('MergedFundGUID');
      if (ReasonId === this.mergerReasonID) {
        mergedFundFamilyGUID.enable();
        mergedFundGUID.enable();
        mergedFundGUID.setValidators([Validators.required]);
        this.requiredMergedFund = true;
      }
      else {
        mergedFundFamilyGUID.reset();
        this.junkFundForm.patchValue({ MergedFundFamilyGUID: this.fundFamilyGUID });
        mergedFundFamilyGUID.disable();
        mergedFundGUID.reset();
        this.junkFundForm.patchValue({ MergedFundGUID: '' });
        mergedFundGUID.disable();
        mergedFundGUID.setValidators(null);
        this.requiredMergedFund = false;
      }

      mergedFundGUID.updateValueAndValidity();
    }
  }

  setExtendedTickerValidation(Ticker: any) {
    if (Ticker) {
      const extendedTicker = this.junkFundForm.get('ExtendedTicker');
      if (Ticker.length < 5) {
        extendedTicker.reset();
        extendedTicker.disable();
      }
      else {
        extendedTicker.enable();
      }
    }
  }

  onSearchJunkFundBtnClick(isSearchBtnClicked: boolean) {
    if (isSearchBtnClicked) {
      this.pagerInfo.PageNumber = 1;
    }
    this.getJunkFundList();
  }

  onDownloadJunkFundBtnClick() {
    this.loadingInfo = true;
    const params = this.getJunkFundParams('basic');
    this.fundService.downloadJunkFundDataByFundFamilyId(params).subscribe((result: any) => {
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

  getJunkFundList() {
    this.loadingInfo = true;
    const params = this.getJunkFundParams('basic');
    this.fundService.getJunkFundsByFundFamilyId(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.junkFundList = result.Data.List;
        if (this.junkFundList.length === 0) {
          this.alertMsg = { show: true, msg: 'No junk funds in selected fund family' };
        }
        else {
          this.alertMsg = { show: false, msg: '' };
        }
      } else {
        this.junkFundList = [];
        this.alertMsg = { show: true, msg: 'No junk funds in selected fund family' };
      }
      this.loadingInfo = false;
    }, (error: any) => {
      // console.log(error)
      this.junkFundList = []; this.loadingInfo = false;
      // this.alertMsg = { show: true, msg: 'No contacts in selected customer' };
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
        this.dropdownList.mergedFndFamilyList = result.Data;
      }
    });
  }

  onMergedFndFamilySelection(evt: any) {
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

  popupClose() {
    this.popup.isAddEdit = false;
  }

  onToggleFilterSidebarBtnClick() {
    this.toggleState = !this.toggleState;
    this.sharedService.toggleSideBar(this.toggleState);
  }

  onResetFormFieldsClick(type: string) {
    this.setJunkFundData(type, this.selectedJunkFundData);
  }

  loadJunkFundData(type: string, data: any) {
    this.selectedJunkFundList = [];
    this.setJunkFundData(type, data);
  }

  setJunkFundData(type: string, data: any) {
    this.popup = { isAddEdit: true, type: type };

    switch (type) {
      case "add": {
        this.createJunkFundForm();
        break;
      }
      case "edit": {
        this.junkFundForm.patchValue({
          GUID: data.GUID,
          Id: data.Id,
          FundName: data.FundName,
          CUSIP: data.CUSIP,
          Ticker: data.Ticker,
          ExtendedTicker: data.ExtendedTicker,
          InternalNumber: data.InternalNumber,
          ReasonId: data.Reason.ID,
          ReasonComments: data.ReasonComments,
          MergedFundFamilyGUID: data.MergedFundFamily.GUID,
          MergedFundGUID: data.MergedFund.GUID,
          Comments: data.Comments,
          FundFamilyGUID: this.fundFamilyGUID
        });
        this.selectedJunkFundData = data;

        this.setMergedFundValidation(data.Reason.ID.toString());
        this.setExtendedTickerValidation(data.Ticker);
        break;
      }
    }
    this.junkFundForm.patchValue({ MergedFundFamilyGUID: this.fundFamilyGUID });
  }

  PerformAction(purpose: string) {
    switch (purpose) {
      case "Add": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'junk fund', type: 'add',
          message: `Click 'ADD' to add junk fund or 'Cancel' to discard`
        });
        break;
      }
      case "Update": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'junk fund', type: 'update',
          message: 'click "SAVE" to save the changes or "Cancel" to discard '
        });
        break;
      }
      case "Delete": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'junk fund', type: 'delete',
          message: 'Are you sure you want to delete this junk fund?', deleteType: 'single'
        });
        break;
      }
      case "DeleteMultiple": {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'junk fund', type: 'delete',
          message: 'Are you sure you want to delete selected junk funds?', deleteType: 'multiple'
        });
        break;
      }
    }
  }

  getJunkFundParams(type: string) {
    switch (type) {
      case "basic":
        console.log(this.filterData.ReasonId);
        return {
          SearchText: this.searchText,
          PageNumber: this.pagerInfo.PageNumber,
          PageSize: this.pagerInfo.PageSize,
          SortOrder: this.pagerInfo.SortOrder,
          SortBy: this.pagerInfo.SortBy,
          MergedFundFamilyGUID: (this.filterData.MergedFundFamilyGUID === '' ? null : this.filterData.MergedFundFamilyGUID),
          ReasonId: (this.filterData.ReasonId === 0 ? null : this.filterData.ReasonId),
          GUID: this.fundFamilyGUID
        };
      case "add":
      case "edit":
        return {
          FundName: this.junkFundForm.value.FundName,
          CUSIP: this.junkFundForm.value.CUSIP,
          Ticker: this.junkFundForm.value.Ticker,
          ExtendedTicker: this.junkFundForm.value.ExtendedTicker,
          InternalNumber: this.junkFundForm.value.InternalNumber,
          ReasonId: (this.junkFundForm.value.ReasonId === '' ? null : this.junkFundForm.value.ReasonId),
          ReasonComments: this.junkFundForm.value.ReasonComments,
          MergedFundFamilyGUID: (this.junkFundForm.value.MergedFundFamilyGUID === '' ? null : this.junkFundForm.value.MergedFundFamilyGUID),
          MergedFundGUID: (this.junkFundForm.value.MergedFundGUID === '' ? null : this.junkFundForm.value.MergedFundGUID),
          Comments: this.junkFundForm.value.Comments,
          FundFamilyGUID: this.fundFamilyGUID,
          GUID: (type === 'edit' ? this.junkFundForm.value.GUID : null)
        };
    }
  }

  addJunkFundInfo() {
    this.loadingInfo = true;
    this.sharedService.waitingSign(true);
    const params = this.getJunkFundParams('add');

    this.fundService.addJunkFundDetails(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          this.pagerInfo.PageNumber = 1;
          this.getJunkFundList();
          this.alertMsg = { show: true, msg: 'Junk fund added successfully.' };
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Junk fund has been added successfully.' });
          this.createJunkFundForm();
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
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Junk fund has not been added successfully.' });
    }, () => {
      this.loadingInfo = false;
      this.sharedService.waitingSign(false);
    });
  }

  updateJunkFundInfo() {
    this.loadingInfo = true;
    this.sharedService.waitingSign(true);
    const params = this.getJunkFundParams('edit');

    this.fundService.updateJunkFundDetails(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          //this.pagerInfo.PageNumber = 1;
          this.getJunkFundList();
          this.alertMsg = { show: true, msg: 'Junk fund updated successfully.' };
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Junk fund has been updated successfully.' });
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
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Junk fund has not been updated successfully.' });
    }, () => {
      this.loadingInfo = false;
      this.sharedService.waitingSign(false);
    });
  }

  deleteJunkFundInfo(type: string) {
    const params = {
      GUID: []
    };
    if (type === 'single') {
      params.GUID.push(this.junkFundForm.value.GUID);
    } else {
      this.selectedJunkFundList.forEach(childObj => params.GUID.push(childObj.GUID));
    }

    this.loadingInfo = true;
    this.fundService.deleteJunkFundDetailsByIds(params).subscribe((result: any) => {
      if (result) {
        if (result.IsSuccess) {
          this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Junk fund has been deleted successfully.' });
          this.popupClose();
          this.pagerInfo.PageNumber = 1;
          this.getJunkFundList();
          this.selectedJunkFundList = (type === 'multiple' ? [] : this.selectedJunkFundList);
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
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to delete junk fund' });
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
}
