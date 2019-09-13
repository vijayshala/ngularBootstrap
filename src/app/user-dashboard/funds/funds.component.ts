import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { FundFamilyInfo, FundFamilyContactFilterModel, 
    SourcedFundFilterModel, PendingFundFilterModel, JunkFundFilterModel, DropDownObj } from './fund.models';
import { Subscription } from 'rxjs';
import { FundService } from 'src/app/services/fund.service';
import { UserProfile } from '../user.class';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-funds',
  templateUrl: './funds.component.html',
  styleUrls: ['./funds.component.css']
})
export class FundsComponent implements OnInit, OnDestroy {
  filterData = {
    fundFamilyContactFilterData: new FundFamilyContactFilterModel(),
    sourcedFundFilterData: new SourcedFundFilterModel(),
    pendingFundFilterData: new PendingFundFilterModel(),
    junkFundFilterData: new JunkFundFilterModel()
  };

  fundFamilyNameList: Array<any>;
  dynamicHt: number;
  searchFundFamily: string;
  selectedFundFamilyObj: any;
  newFundFamilyObj = new FundFamilyInfo();

  fundFamilyList = [];
  listPageNumber = 1;
  toggleFilterSlider: boolean;
  loadingInfo: boolean;
  fundFamilyListLoader: boolean;
  selectedTabView: string;
  pagingObj = { pageSize: 50, sortOrder: 'Desc', sortBy: '', totalRecords: '', currentPageRec: 0};

  dropdownList = new DropDownObj(); // {
  //   weekendTypeList: [],
  //   navOffsetTypeList: [],
  //   milRateOffsetTypeList: [],
  //   shareClassList: [],
  //   selectedOmnibusList: [],
  //   deselectOmnibusList: [],
  //   unlinkOmnibusListRecords: [],
  //   searchLinkRecords: ''
  // };

  popup: any = { addEditFund: false, fundTyp: '' };

  alertSubs: Subscription;
  userPSubs: Subscription;
  user = new UserProfile();

  constructor(private sharedService: SharedService, private commonService: CommonService, private fundService: FundService) {
    this.dynamicHt = window.innerHeight - 200;
  }

  ngOnInit() {
    this.sharedService.togglebar.asObservable().subscribe((res: any) => {
      this.toggleFilterSlider = res;
    });

    this.alertSubs = this.sharedService.confirmationPopup$.subscribe((res: any) => {
      if (res.hasOwnProperty('options') && res.options === 'close') {
        if (res.callfrom === 'fund family' && res.type === 'add') {
          this.addFundFamilyInfo();
        }
        if (res.callfrom === 'fund family' && res.type === 'update') {
          this.updateFundFamilyInfo();
        }
        if (res.callfrom === 'fund family' && res.type === 'delete') {
          this.deleteFundFamilyInfo();
        }
      }
    });

    this.userPSubs = this.sharedService.userProfile$.subscribe((res: any) => {
      if (res.hasOwnProperty('options') && res.options === 'userProfile' && res.type === 'onload') {
        this.user = res.userDetails;
        setTimeout(() => {
          this.getFundFamilyList();
        }, 10);
      }
    });

    this.getWeekendTypeList();
    this.getNavOffsetTypeList();
    this.getMilRateOffsetTypeList();
    // this.getShareClassList();
  }

  ngOnDestroy() {
    this.alertSubs.unsubscribe();
    this.userPSubs.unsubscribe();
  }

  trackFn(inx: any, item: any) {
    return item;
  }

  checkForAlpaNumericOnly(event: any) {
    const pattern = /^[\w\s]$/; const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  getWeekendTypeList() {
    this.commonService.getWeekendTypeList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.weekendTypeList = result.Data;
      }
    });
  }

  getNavOffsetTypeList() {
    this.commonService.getNAVOffsetTypeList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.navOffsetTypeList = result.Data;
      }
    });
  }

  getMilRateOffsetTypeList() {
    this.commonService.getMilRateOffsetTypeList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.milRateOffsetTypeList = result.Data;
      }
    });
  }

  getShareClassList() {
    // this.sharedService.fundList();
    this.commonService.getShareClassList(0).subscribe((result: any) => {
      if (result && result['IsSuccess']) {
        this.dropdownList.shareClassList = result.Data;
      }
    });
  }


  link_unlink_OmnibusRecords(type: string) {
    if (type === 'unlink-to-link') {
      if (this.dropdownList.selectedOmnibusList) {
        if (this.newFundFamilyObj.NewLinkedSharedClassList) {
          let temp = this.newFundFamilyObj.NewLinkedSharedClassList;
          this.dropdownList.selectedOmnibusList.forEach((p) => temp.push(p));
          this.newFundFamilyObj.NewLinkedSharedClassList = [];
          setTimeout(() => {
            this.newFundFamilyObj.NewLinkedSharedClassList = temp;
          }, 50);
          // console.log('ssssssssssss', this.newFundFamilyObj.NewLinkedSharedClassList )
        } else {
          this.newFundFamilyObj.NewLinkedSharedClassList = this.dropdownList.selectedOmnibusList;
        }
        this.dropdownList.shareClassList = this.dropdownList.shareClassList.filter((d, indx) => {
          return !this.dropdownList.selectedOmnibusList.includes(d);
        });
        this.dropdownList.selectedOmnibusList = [];
      }
    }

    if (type === 'link-to-unlink') {
      if (this.dropdownList.deselectOmnibusList.length) {
        let shareTemp = this.dropdownList.shareClassList;
        this.dropdownList.deselectOmnibusList.forEach((p) =>  shareTemp.unshift(p));
        this.dropdownList.shareClassList = [];
        setTimeout(() => {
          this.dropdownList.shareClassList = shareTemp;
        }, 50);

        this.newFundFamilyObj.NewLinkedSharedClassList = this.newFundFamilyObj.NewLinkedSharedClassList.filter((d) => {
          return !this.dropdownList.deselectOmnibusList.includes(d);
        });
      }
      setTimeout(() => {
        this.dropdownList.deselectOmnibusList = [];
      }, 60);
    }
  }

  selectingOmnibusType(type: string, data: any, index: any) {
    if (type === 'unlink-to-link') {
      // this.dropdownList.selectedOmnibusList.unshift(data);
      // this.newFundFamilyObj.NewLinkedSharedClassList.unshift(data);
      // setTimeout(() => {
      //   this.dropdownList.shareClassList.splice(index, 1);
      // }, 50);
    }

    if (type === 'link-to-unlink') {
      // this.dropdownList.shareClassList.push(data);
      // setTimeout(() => {
      //   this.newFundFamilyObj.NewLinkedSharedClassList.splice(index, 1);
      //   // this.dropdownList.selectedOmnibusList.splice(index, 1);
      // }, 50);
    }
  }

  onRefreshBtnClick() {
    this.sharedService.notifyFilter(this.filterData);
  }

  onApplyFilterClick(data: any) {
    this.filterData = data;
    this.sharedService.notifyFilter(this.filterData);
  }

  searchFundFamilyOnClick() {
    this.listPageNumber = 1;
    this.getFundFamilyList();
  }

  onFundFamilyListScroll() {
    if (!this.fundFamilyListLoader && (this.pagingObj.currentPageRec >= this.pagingObj.pageSize)) {
      this.listPageNumber += 1;
      this.getFundFamilyList();
    }
  }

  getFundFamilyList() {
    // this._shareds.waitingSign(true);
    this.fundFamilyListLoader = true;
    const params = {
      SearchText: (this.searchFundFamily ? this.searchFundFamily : ''),
      PageNumber: this.listPageNumber,
      PageSize: this.pagingObj.pageSize,
      SortOrder: this.pagingObj.sortOrder,
      SortBy: ''
    };
    // console.log(params);
    this.fundService.getFundFamilyDetailsList(params).subscribe((result: any) => {
      // console.log(result)
      if (result && result.IsSuccess) {
        if (this.listPageNumber === 1) {
          this.fundFamilyNameList = result['Data']['List'];
          this.selectedFundFamilyObj = this.fundFamilyNameList[0];
          this.onTabSelection('contact');
          this.pagingObj.currentPageRec = result['Data']['List'].length;
        } else {
          this.fundFamilyNameList = this.fundFamilyNameList.concat(result['Data']['List']);
          this.pagingObj.currentPageRec = result['Data']['List'].length;
        }
      } else {
        this.fundFamilyNameList = [];
      }
    }, (error) => {
    }, () => {
      this.fundFamilyListLoader = false;
      // this._shareds.waitingSign(false);
    });
  }

  toggleSBF() {
    this.toggleFilterSlider = !this.toggleFilterSlider;
    this.sharedService.toggleSideBar(this.toggleFilterSlider);
  }

  // Close popups
  popupClose() {
    this.popup = { addEditFund: false, fundTyp: '' };
  }

  // Close right filter bar
  onSidebarFilterCloseBtnClick() {
    this.sharedService.toggleSideBar(!this.toggleFilterSlider);
  }

  // Selection of Fund for details
  selectFundFamily(fd: any) {
    this.selectedFundFamilyObj = fd;
    this.onTabSelection('contact');
  }

  // Fund Tab option selection //
  onTabSelection(type: string) {
    this.selectedTabView = type;
    // console.log(this.seletedTab)
  }

  // Open popup for fund contact add/edit //
  openFundFamilyPopup(type: string) {
    switch (type) {
      case 'add': {
        this.newFundFamilyObj = new FundFamilyInfo();
        this.popup = { addEditFund: true, fundTyp: type };
        this.getShareClassList();
        break;
      }
      case 'edit': {
        const params = {
          GUID: this.selectedFundFamilyObj.GUID
        };
        this.fundService.getFundFamilyDetailsById(params).subscribe((result: any) => {
          if (result && result.IsSuccess) {
            // console.log(result.Data)
            // this.dropdownList.shareClassList = [];
            this.newFundFamilyObj = result.Data;
            this.newFundFamilyObj.NewLinkedSharedClassList = result['Data']['LinkedShareClassList'];
            this.dropdownList.shareClassList = result['Data']['UnlinkedShareClassList'];
            // console.log(result.Data);
            this.popup = { addEditFund: true, fundTyp: type };
          }
        });
        break;
      }
    }
  }

  PerformAction(purpose: string) {
    switch (purpose) {
      case 'Add': {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'fund family', type: 'add',
          message: `Click 'ADD' to add fund family or 'Cancel' to discard`
        });
        break;
      }
      case 'Update': {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'fund family', type: 'update',
          message: `Click 'SAVE' to save the changes you have made or 'Cancel' to discard`
        });
        break;
      }
      case 'Delete': {
        this.sharedService.callConfirmPopup({
          options: 'open', show: true, callfrom: 'fund family', type: 'delete',
          message: 'Are you sure you want to delete this fund family?', deleteType: 'single'
        });
        break;
      }
    }
  }

  addFundFamilyInfo() {
   // this.loadingInfo = true;
    const updateparams = {
      Name: this.newFundFamilyObj.Name,
      Comments: this.newFundFamilyObj.Comments,
      AllowSort: this.newFundFamilyObj.AllowSort,
      WeekendType: this.newFundFamilyObj.WeekendType,
      NavOffset: this.newFundFamilyObj.NavOffset,
      MilRateOffset: this.newFundFamilyObj.MilRateOffset,
      NewLinkedSharedClassList: this.convertNewLinkedSCL()
    };
    // console.log(updateparams)
    this.fundService.addFundFamilyDetails(updateparams).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Fund family information updated successfully.' });
        this.newFundFamilyObj = new FundFamilyInfo();
        this.popupClose();
        this.listPageNumber = 1;
        this.getFundFamilyList();
      } else {
        this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to update fund family information' });
      }
      this.loadingInfo = false;
    }, (err: any) => {
      this.loadingInfo = false;
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to update fund family information' });
    });
  }

  updateFundFamilyInfo() {
    this.loadingInfo = true;
    const updateparams = {
      Name: this.newFundFamilyObj.Name,
      Comments: this.newFundFamilyObj.Comments,
      AllowSort: this.newFundFamilyObj.AllowSort,
      WeekendType: this.newFundFamilyObj.WeekendType,
      NavOffset: this.newFundFamilyObj.NavOffset,
      MilRateOffset: this.newFundFamilyObj.MilRateOffset,
      NewLinkedSharedClassList: this.convertNewLinkedSCL(),
      GUID: this.selectedFundFamilyObj.GUID
    };
    // console.log(updateparams);
    this.fundService.updateFundFamilyDetails(updateparams).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Fund family information updated successfully.' });
        this.newFundFamilyObj = new FundFamilyInfo();
        this.popupClose();
        this.listPageNumber = 1;
        this.getFundFamilyList();
      } else {
        this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to update fund family information' });
      }
      this.loadingInfo = false;
    }, (err: any) => {
      this.loadingInfo = false;
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to update fund family information' });
    });
  }


  convertNewLinkedSCL() {
    if (this.newFundFamilyObj.NewLinkedSharedClassList && this.newFundFamilyObj.NewLinkedSharedClassList.length) {
      let tempListArray = [];
      this.newFundFamilyObj.NewLinkedSharedClassList.forEach((d: any) => tempListArray.push(d.GUID) );
      return tempListArray;
    }
  }

  deleteFundFamilyInfo() {
    this.loadingInfo = true;
    const params = {
      GUID: [this.selectedFundFamilyObj.GUID]
    };
    this.fundService.deleteFundFamilyDetailsByIds(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Fund family information deleted successfully.' });
        this.newFundFamilyObj = new FundFamilyInfo();
        this.popupClose();
        this.listPageNumber = 1;
        this.getFundFamilyList();
      } else {
        this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to delete fund family information' });
      }
      this.loadingInfo = false;
    }, (err: any) => {
      this.loadingInfo = false;
      this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to delete fund family information' });
    });
  }
}
