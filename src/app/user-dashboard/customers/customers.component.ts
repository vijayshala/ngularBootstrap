import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

import { Subscription, from } from 'rxjs';
import { CustomerService } from 'src/app/services/customer.service';
import { UserProfile } from '../user.class';
import { CustomerListInfo, CustomerAddEdit, CustomerServices } from './customer.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from 'src/app/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit, OnDestroy {

  customerNameList: Array<CustomerListInfo>;
  selectedCust: any; // = new CustomerListInfo();
  searchCustomer: string;
  loadingInfo: boolean;
  customerListLoader: boolean;
  //modelBodyView:boolean;

  contactFilter = {
    DataSourceId: -1,
    DepartmentId: -1,
    State: -1,
    City: -1
  };

  fundFilter = {
    FundFamilyID: -1,
    IsNav: -2,
    IsMil:-2,
    IsDistribution:-2

  };

  pendingFundFilter = {
    FundFamilyID: -1
  };


  addCustomer = new CustomerAddEdit();
  custPopups: any = { showCustomerForm: false, deleteContact: false, AMImportpp: false, actionType: '' };
  assetMasterImpt: any = { filename: '', importType: '', file: {},  modelBodyView:'' , importResponseStatus:'' , importResponseMsg:''};
  toggleFilterSlider: boolean;

  fundFamilyList = [];
  seletedTab: string;

  dynamicHt: any;
  alertSubs: Subscription;
  userPSubs: Subscription;
  user = new UserProfile();
  listPageNumber = 1;
  waitForCityList: boolean;

  customerFilters: any;
  pagingObj = { pageSize: '50', sortOrder: 'Asc', sortBy: '', totalRecords: '', currentPageRec: '0'};

  dropdownList = {
    departmentList: [],
    dataSourceList: [],
    typeOfContact: [],
    stateList: [],
    cityList: [],
    positionList: [],
    fundFamilyList: []
  };


  constructor(private _shareds: SharedService, private customerService: CustomerService, private commonService: CommonService,
    private aRoute: ActivatedRoute, private route: Router) {
    this.dynamicHt = window.innerHeight - 200;
  }

  ngOnInit() {

    let customerName = this.aRoute.snapshot.paramMap.get('cname');
    // console.log('redirecttttt', customerName)

    this.customerFilters = this._shareds.clearedCustomerFilterData('all');

    this._shareds.togglebar.asObservable().subscribe((res: any) => {
      this.toggleFilterSlider = res;
    });

    this.alertSubs = this._shareds.confirmationPopup$.subscribe((res: any) => {
      if (res.hasOwnProperty('options') && res.options === 'close') {
        if (res.callfrom === 'customer' && res.type === 'add') {
          this.callAddCustomer();
        }
        if (res.callfrom === 'customer' && res.type === 'update') {
          this.updateCustomerApi();
        }
        if (res.callfrom === 'customer' && res.type === 'delete') {
          this.deleteCustomer();
        }
        if (res.callfrom === 'asset master' && res.type === 'upload') {
         // console.warn('uploadiing a sdfffilesss', this.assetMasterImpt);
          this.uploadAssetMaster();
        }
        if (res.callfrom === 'asset master' && res.type === 'back') {
          // this.updateCustomerApi('delete');
          console.warn('uploadiing a sdfffilesss', this.assetMasterImpt);
          this.uploadAssetMaster();
        }
      }
    });

    this.userPSubs = this._shareds.userProfile$.subscribe((res: any) => {
      if (res.hasOwnProperty('options') && res.options === 'userProfile' && res.type === 'onload') {
        this.user = res.userDetails;
        setTimeout(() => {
          if (customerName) {
            this.searchCustomer = customerName;
          }
          this.getCustomerList();
          this.callFundFamilyList();
        }, 10);
      }
    });

    this.getDataSrcList();
    this.getDeptList();
    this.getStates();

  }

  ngOnDestroy() {
    this.alertSubs.unsubscribe();
    this.userPSubs.unsubscribe();
  }

  popupClose(param: string) {
    this.custPopups = { showCustomerForm: false, AMImportpp: false };
  }

  closeSidebarFilter() {
    this._shareds.toggleSideBar(!this.toggleFilterSlider);
  }

  onTabSelection(type: string) {

    this.initFilterPane();

    // Hide filter pane if tab changes and filter pane is active
    if (type != this.seletedTab && this.toggleFilterSlider) {
      this.toggleFilterSlider = !this.toggleFilterSlider;
    }

    this.seletedTab = type;
    // console.log(this.seletedTab)
  }

  checkForAlpaNumeric(event: any) {
    const pattern = /^[\w\s]$/; const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  choseCustomer(cust: any) {
    this.selectedCust = cust;
    this.onTabSelection('contacts');

  }

  onCustomerListScroll() {
    if (!this.customerListLoader && (this.pagingObj.currentPageRec >= this.pagingObj.pageSize)) {
      // console.log('tetstststd scrollll')
      this.listPageNumber += 1;
      this.getCustomerList();
    }
  }

  trackFn(inx: any, item: any) {
    return item;
  }

  searchCustomerOnClick() {
    this.listPageNumber = 1;
    // this.getCustomerList();
    if (this.searchCustomer === '' || this.searchCustomer === undefined || this.searchCustomer === null) {
      this.route.navigateByUrl('/dashboard/customers');
    } else {
      this.getCustomerList();
    }
  }

  /// Get Customer List
  getCustomerList() {
    // this._shareds.waitingSign(true);
    this.customerListLoader = true;
    const params = {
      customerId: -1,
      searchtext: (this.searchCustomer ? this.searchCustomer : ''),
      PageNumber: this.listPageNumber,
      PageSize: this.pagingObj.pageSize,
      SortOrder: this.pagingObj.sortOrder,
      SortBy: this.pagingObj.sortBy,
      TotalRecords: ''
    };
    this.customerService.getCustomers(params).subscribe((result: any) => {
     // console.log(result)
      if (result && result.IsSuccess) {
        if (this.listPageNumber === 1) {
          this.customerNameList = result['Data']['List'];
          this.selectedCust = this.customerNameList[0];
          this.pagingObj.totalRecords = result['Data']['Pager']['TotalRecords'];
          this.pagingObj.currentPageRec = result['Data']['List'].length;
          this.onTabSelection('contacts');
        } else {
          this.customerNameList = this.customerNameList.concat(result['Data']['List']);
          this.pagingObj.totalRecords = result['Data']['Pager']['TotalRecords'];
          this.pagingObj.currentPageRec = result['Data']['List'].length;
        }
      } else {
        // this.customerNameList = [];
      }
    }, (error) => {
      this.customerNameList = [];
    }, () => {
      this.customerListLoader = false;
      // this._shareds.waitingSign(false);
    });
  }

  /// Get Fund Family List For Linking Source/Pending Funds
  callFundFamilyList() {
    this.commonService.getFundFamilyList().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.fundFamilyList = result['Data'];
        this.fundFamilyList =  result['Data'];
      }
    }, (err) => {
      console.warn('fund fam list failed fo linked data', err);
    });
  }


  resetCustomerForm(actionType: string) {
    this.setCustomerForm(actionType, this.selectedCust);
  }

  setCustomerForm(actionType: string, customer: any) {
    this.custPopups.actionType = actionType;
    if (actionType === 'edit') {
      this.addCustomer.customerName = customer.Name;
      this.addCustomer.startDate = new Date(customer.StartDate);
      this.addCustomer.email = customer.Emailaddress;
      this.addCustomer.fileDirectory = customer.DirectoryPath;

      if (customer.SubscribedServices != null) {
        this.addCustomer.navFile = customer.SubscribedServices.includes(CustomerServices.NAV);
        this.addCustomer.mil = customer.SubscribedServices.includes(CustomerServices.MilRate);
        this.addCustomer.distribution = customer.SubscribedServices.includes(CustomerServices.Distribution);
        this.addCustomer.dividentCalendar = customer.SubscribedServices.includes(CustomerServices.DividendCalendar);
      }

    } else {
      this.addCustomer = new CustomerAddEdit();
    }
    this.custPopups.showCustomerForm = true;

  }

  openCustomerPopup(actionType: string) {
    this.setCustomerForm(actionType, this.selectedCust);
  }

  resetFormValues() {
    this.addCustomer = new CustomerAddEdit();
    this.custPopups.showCustomerForm = true;
  }

  addCustomerConfirmation() {
    this._shareds.callConfirmPopup({
      options: 'open', show: true, callfrom: 'customer', type: 'add',
      message: `Are you sure you want to add this customer? click 'Add' to add customer and 'Cancel' to discard`
    });
  }

  updateCustomerConfirmation() {
    this._shareds.callConfirmPopup({
      options: 'open', show: true, callfrom: 'customer', type: 'update',
      message: `Are you sure you want to update this contact? click 'Update' to update customer and 'Cancel' to discard`
    });

  }


  deleteCustomerConfirmation() {
    this._shareds.callConfirmPopup({
      options: 'open', show: true, callfrom: 'customer', type: 'delete',
      message: `Are you sure you want to delete this contact? click 'Remove' to remove customer and 'Cancel' to discard`
    });
  }

  /// Update Customer Details
  updateCustomerApi() {
    // console.log('updateCustomerApi');
    this.loadingInfo = true;
    const updateparams = {
      CustomerID: this.selectedCust.Customer_ID,
      Name: this.addCustomer.customerName,
      StartDate: this.addCustomer.startDate.toLocaleString(),
      SubscribedServices: this.checkSubscribtionVals_Return(),
      Emailaddress: this.addCustomer.email
    };
    this.customerService.addUpdateCustomer(updateparams).subscribe((result: any) => {
      if (result && result['IsSuccess']) {
        this._shareds.toastMsgAlert({ options: 'alert', msg: 'Customer information updated successfully.' });
        this.addCustomer = new CustomerAddEdit();
        this.popupClose('ts');
        this.listPageNumber = 1;
        this.getCustomerList();
      } else {
        this._shareds.toastMsgAlert({ options: 'alert', msg: 'Unable to update information' });
      }
      this.loadingInfo = false;
    }, (err: any) => {
      this.loadingInfo = false;
    });
  }

  /// Add New Customer
  callAddCustomer() {
   //  console.log('callAddCustomer');
    this.loadingInfo = true;
    const params = {
      Name: this.addCustomer.customerName,
      StartDate: this.addCustomer.startDate.toLocaleString(),
      SubscribedServices: this.checkSubscribtionVals_Return(),
      Emailaddress: this.addCustomer.email
    };
    // console.log(params)
    this.customerService.addUpdateCustomer(params).subscribe((result: any) => {
      if (result && result['IsSuccess']) {
        this._shareds.toastMsgAlert({ options: 'alert', msg: 'Customer added successfully.' })
        this.addCustomer = new CustomerAddEdit();
        this.popupClose('ts');
        this.listPageNumber = 1;
        this.getCustomerList();
      } else {
        this._shareds.toastMsgAlert({ options: 'alert', msg: result['Message'] });
      }
      this.loadingInfo = false;
    }, (err: any) => {
      this.loadingInfo = false;
    });
  }


  checkSubscribtionVals_Return(): any {
    let tempArr = [];
    if (this.addCustomer.navFile) {
      tempArr.push('1');
    }
    if (this.addCustomer.mil) {
      tempArr.push('2');
    }
    if (this.addCustomer.distribution) {
      tempArr.push('3');
    }
    if (this.addCustomer.dividentCalendar) {
      tempArr.push('7');
    }
    return tempArr;
  }

  deleteCustomer() {
    let customerList = [];
    customerList.push(this.selectedCust.Customer_ID);
    this.callDeleteCustomerApi(customerList);
  }

  callDeleteCustomerApi(customerList: any) {
    this.loadingInfo = true;
    const params = {
      IntegerList: customerList
    };

    this.customerService.deleteCustomers(params).subscribe((result: any) => {
      if (result && result['IsSuccess']) {
        this._shareds.toastMsgAlert({ options: 'alert', msg: 'Customer removed successfully.' })
        this.addCustomer = new CustomerAddEdit();
        this.popupClose('ts');
        this.loadingInfo = false;
        this.getCustomerList();
      }
    }, (err: HttpErrorResponse) => {
      this.loadingInfo = false;
      if (err['error']['StatusCode'] === 500) {
        this._shareds.toastMsgAlert({ options: 'alert', msg: err['error']['Message'] })
      }
    });
  }


  /// Asset Master Import
  importAssetMasterFile(ev: any) {
     // console.log(ev, ev.target.files)
    if (ev.target.files && ev.target.files[0]) {
      this.assetMasterImpt.filename = ev.target.files[0].name;
      this.assetMasterImpt.file = ev.target.files[0];
      ev.srcElement.value = '';
    }
    // const reader = new FileReader();
    // this.eventPost.imageHolder = event.target.files[0];
    //   reader.onload = (evt: any) => {
    //     this.eventPost.imageUrl = (<FileReader>evt.target).result;
    //   }
    //   reader.readAsDataURL(event.target.files[0]);
    //   event.srcElement.value = '';
  }


  /// Confrim popup for file upload
  importFiles() {
    this._shareds.callConfirmPopup({
      options: 'open', show: true, callfrom: 'asset master', type: 'upload',
      message: `Are you sure you want to upload selected file? click 'Save' to upload or 'Cancel' to discard`
    });
  }

  /// Call Api to Upload Assert Master Import File /// 
  uploadAssetMaster() {
    const formData = new FormData();
    formData.append('customerId', this.selectedCust.Customer_ID);
    formData.append('importoption', '1');
    formData.append('file', this.assetMasterImpt.file);

    this.customerService.addAssertMasterImportFile(formData).subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.assetMasterImpt.modelBodyView = true,
        this.assetMasterImpt.importResponseMsg = result['Message']
        this.assetMasterImpt.importResponseStatus = result['StatusCode']
      } 
    }, (err) => {
      this.assetMasterImpt.importResponseStatus = err.status , 
      this.assetMasterImpt.importResponseMsg = err.statusText,
      this.assetMasterImpt.modelBodyView = true
    });

  }


  // Fetch Dropdown data for filters
  getDataSrcList() {
    this.commonService.getDataSourceList().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.dataSourceList = result['Data'];
        this.customerFilters.contacts.DataSourceId = -1;
      }
    });
  }

  getDeptList() {
    this.commonService.getDepartmentList().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.departmentList = result['Data'];
        this.customerFilters.contacts.DepartmentId = -1;
      }
    });
  }

  getStates() {
    this.commonService.getStateList().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.stateList = result['Data'];
        this.customerFilters.contacts.State = -1;
      }
    });

  }

  onStateSelection(evt: any) {
    // console.log("state selection", evt, evt.target.value)
    if (evt.target.value) {
      this.getCityList(evt.target.value);
    }
  }

  getCityList(id: string) {

    this.waitForCityList = true;
    this.commonService.getCityListByStateId(id).subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.cityList = result['Data'];
        this.customerFilters.contacts.City = -1;
      }
    }, (err) => { }, () => {
      this.waitForCityList = false;
    });
  }

  setCustomerFilters() {

    switch (this.seletedTab) {
      case "contacts":
        this._shareds.setCustomerContactsFilter();
        break;

      case "sourceFunds":
        this._shareds.setCustomerSourceFundsFilter();
        break;

      case "pendingFunds":
        this._shareds.setCustomerPendingFundsFilter();
        break;
    }
  }

  resetCustomerFilters() {
    switch (this.seletedTab) {
      case "contacts":
        this.resetContactFilter();
        break;

      case "sourceFunds":
        this.resetSourceFundFilter();
        break;

      case "pendingFunds":
        this.resetPendingFundFilter();
        break;
    }
    
    //this.getCityList(this.customerFilters.contacts.State);
    //this.initFilterPane();
  }
  resetContactFilter(){
    this.contactFilter.DataSourceId = -1;
    this.contactFilter.DepartmentId = -1;
    this.contactFilter.State = -1;
    this.contactFilter.City = -1;
    this.dropdownList.cityList = [];
  }

  resetSourceFundFilter(){
    this.fundFilter.FundFamilyID = -1;
    this.fundFilter.IsNav = -2;
    this.fundFilter.IsMil = -2;
    this.fundFilter.IsDistribution = -2;
  }

  resetPendingFundFilter(){
    this.pendingFundFilter.FundFamilyID = -1;
  }

  initFilterPane() {
    
    this.customerFilters = this._shareds.clearedCustomerFilterData("all");
    this.resetCustomerFilters();

    //Set Default selected filter properties 
    this.customerFilters.contacts.DataSourceId = -1;
    this.customerFilters.contacts.DepartmentId = -1;
    this.customerFilters.contacts.State = -1;
    this.customerFilters.contacts.City = -1;

  }

}
