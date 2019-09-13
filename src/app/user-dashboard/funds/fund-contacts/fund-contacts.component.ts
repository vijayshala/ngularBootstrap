import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Subscription } from 'rxjs';
import { FundFamilyContactInfo, Hours, FundFamilyContactFilterModel } from '../fund.models';
import { FundService } from 'src/app/services/fund.service';
import { UserProfile } from '../../user.class';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NodeData } from '@angular/core/src/view';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-fund-family-contacts',
  templateUrl: './fund-contacts.component.html',
  styleUrls: ['./fund-contacts.component.css']
})
export class FundContactsComponent implements OnInit, OnChanges {
  @Input() fundFamilyGUID: string;
  @Input() filterData: FundFamilyContactFilterModel;
  
  contactDataArray: any = [];
  selectMultiContacts = [];
  contactForm = new FormGroup({});
  toggleState: boolean;

  ffcPopups: any = { ffcPP: false, type: '' };
  loadingInfo: boolean;
  alertMsg: any = { show: false, msg: '' };
  waitForCityList: boolean;
  alertSubs: Subscription;
  contactPageNo: 1;
  
  dropdownList = {
    departmentList: [],
    dataSourceList: [],
    stateList: [],
    cityList: [],
    locationList: [],
    weekDayList : [],
    phoneNumberTypeList : []
  };

  constructor(private sharedService: SharedService, private commonService: CommonService, private fundService: FundService) { }

  ngOnInit() {
    this.createFundFamilyContactForm();

    this.sharedService.togglebar.asObservable().subscribe((res: any) => {
      this.toggleState = res;
    });

    this.alertSubs = this.sharedService.confirmationPopup$.subscribe((res: any) => {
      // console.warn(res);
      if (res.hasOwnProperty('options') &&  res.options === 'close') {
        if (res.callfrom === 'fund family contact' && res.type === 'delete') {
          this.deleteFundContact();
        }
        if (res.callfrom === 'fund family contact' && res.type === 'add') {
          this.addUpdateFundFamilyContact(res.type)
        }
        if (res.callfrom === 'fund family contact' && res.type === 'update') {
          this.addUpdateFundFamilyContact(res.type)
        }
      }
    });    

    this.getDepartmentList();
    this.getDataSourceList();
    this.getWeekDayList();
    this.getStateList();
    this.getLocationList(); 
    this.getPhoneNumberTypeList();    
  }

  ngOnChanges() {
    // console.log('idddd', this.customerId);
    this.selectMultiContacts = [];
    this.getFundFamilyContactList();
  }

  createFundFamilyContactForm(){
    this.contactForm = new FormGroup({
      Name: new FormControl('', [Validators.required, Validators.maxLength(80), this.noWhitespace]),
      PrimaryEmailAddress: new FormControl(''),
      EmailList: new FormControl(''),
      Position: new FormControl(''),
      AddressLine1: new FormControl(''),
      AddressLine2: new FormControl(''),
      AddressLine3: new FormControl(''),
      StateName: new FormControl(),
      StateId: new FormControl(),
      CityId: new FormControl(),
      Zipcode: new FormControl(''),
      Location: new FormControl(''),
      PrimaryPhone: new FormControl(''),
      PhoneList: new FormControl(''),
      DataSourceId: new FormControl(''),
      DataSourceName: new FormControl(''),
      DepartmentId: new FormControl(''),
      DepartmentName: new FormControl(''),
      Days: new FormControl(''),
      Hours: new FormControl(''),
      HoursToShow: new FormControl(''),
      FundFamilyGUID: new FormControl(''),
      GUID: new FormControl(''),
      Id: new FormControl('')
    });
  }

  public noWhitespace(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
  }
  
  getFundFamilyContactList(){
    this.loadingInfo = true;
    const params = {
      DataSourceId:null,
      DepartmentId:null,
      StateId:0,
      CityId:0,
      Location:"",
      Days:"",
      SearchText: '',
      PageNumber: this.contactPageNo,
      PageSize: '100',
      SortOrder: 'Desc',
      SortBy: '',
      GUID:this.fundFamilyGUID
    };
    this.fundService.getFundFamilyContactDetailsByFundFamilyId(params).subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.alertMsg = { show: false, msg: '' };
        this.contactDataArray = result.Data.List;
      } else {
        this.contactDataArray = [];
        this.alertMsg = { show: true, msg: 'No contacts in selected fund family' };
      }
      this.loadingInfo = false;
    }, (error: any) => {
      // console.log(error)
      this.contactDataArray = []; this.loadingInfo = false;
      // this.alertMsg = { show: true, msg: 'No contacts in selected customer' };
    });
  }

  getDataSourceList(){
    this.commonService.getDataSourceList().subscribe((result : any)=>{
      if (result && result.IsSuccess) {
       this.dropdownList.dataSourceList = result.Data;
       }
     });
  }

  getDepartmentList(){
    this.commonService.getDepartmentList().subscribe((result : any)=>{
      if (result && result.IsSuccess) {
       this.dropdownList.departmentList = result.Data;
       }
     });
  }

  getWeekDayList(){
    var dataList = [];
    this.commonService.getDayTypeList().subscribe((result : any)=>{
     if (result && result.IsSuccess) {
        result.Data.forEach(childObj => dataList.push({label: childObj.DisplayText, value: childObj.Value }));        
      } else {
        dataList  = [];
      }
    });

    this.dropdownList.weekDayList = dataList;
  }

  getLocationList(){
    this.commonService.getLocationTypeList().subscribe((result : any)=>{
     if (result && result.IsSuccess) {
      this.dropdownList.locationList = result.Data;
      }
    });
  }

  getPhoneNumberTypeList(){
    this.commonService.getPhoneNumberTypeList().subscribe((result : any)=>{
     if (result && result.IsSuccess) {
      this.dropdownList.phoneNumberTypeList = result.Data;
      }
    });
  }

  getStateList(){
    this.commonService.getStateList().subscribe((result : any)=>{
      if (result && result.IsSuccess) {
       this.dropdownList.stateList = result.Data;
       }
     });
  }

  onStateSelection(evt: any) {
    // console.log(evt, evt.target.value)
    if (evt.target.value) {
      this.getCityList(evt.target.value);
    }
  }

  getCityList(id: string) {
    this.waitForCityList = true;
    this.commonService.getCityListByStateId(id).subscribe((result: any) => {
      if (result && result.IsSuccess) { 
        this.dropdownList.cityList = result.Data;
      }
    }, (err) => {}, () => {
      this.waitForCityList = false;
    });
  }

  selectAllFundFamilyContactToDelete() {
    this.sharedService.callConfirmPopup({options: 'open', show: true, callfrom: 'fund family contact', type: 'delete',
    message: `Are you sure you want to delete all selected fund family contacts? click 'Remove' to delete selected fund family contacts OR 'Cancel' to discard`});
  }

  popupClose() {
    this.ffcPopups = {ffcPP: false, type: ''};
  }

  openContactInfo(type: string, data: any) {
    switch(type) { 
      case "add": { 
        this.createFundFamilyContactForm();
        this.ffcPopups = { ffcPP: true, type: type };
         break; 
      } 
      case "edit": { 
        this.ffcPopups = { ffcPP: true, type: type };      
        this.contactForm.setValue({
          Name: data.Name,
          PrimaryEmailAddress: data.PrimaryEmailAddress,
          //EmailList: data.EmailList,
          //Position: data.Position,
          AddressLine1: data.AddressLine1,
          AddressLine2: data.AddressLine2,
          AddressLine3: data.AddressLine3,
          //StateName: data.StateName,
          StateId: data.StateId,
          CityId: data.CityId,
          Zipcode: data.Zipcode,
          Location: data.Location,
          PrimaryPhone: data.PrimaryPhone,
          //PhoneList: data.PhoneList,
          DataSourceId: data.DataSourceId,
          //DataSourceName: data.DataSourceName,
          DepartmentId: data.DepartmentId,
          //DepartmentName: data.DepartmentName,
          Days: data.Days,
          Hours: data.Hours,
          //HoursToShow: data.HoursToShow,
          FundFamilyGUID: data.FundFamilyGUID,
          GUID: data.GUID,
          Id: data.Id,
        });
         break;    
      } 
   }
  }

  PerformAction(purpose: string){
    switch(purpose) { 
      case "Add": { 
        this.sharedService.callConfirmPopup({options: 'open', show: true, callfrom: 'fund family contact', type: 'add',
        message: 'click "ADD" to add the fund family contact  or click "Cancel" to discard '});
         break; 
      } 
      case "Update": { 
        this.sharedService.callConfirmPopup({options: 'open', show: true, callfrom: 'fund family contact', type: 'update',
        message: 'click "SAVE" to save the changes or click "Cancel" to discard '});
         break; 
      } 
      case "Delete": {
        this.sharedService.callConfirmPopup({options: 'open', show: true, callfrom: 'fund family contact', type: 'delete',
        message: 'Are you sure you want to delete this fund family contact?', deleteType: 'single'});
         break;    
      } 
   }
  }

  toggleFilterSidebar() {
    this.toggleState = !this.toggleState;
    this.sharedService.toggleSideBar(this.toggleState);
  }

  addUpdateFundFamilyContact(t: string) {
    if (t === 'add') {
      console.log('add new fund family');
    } else if (t === 'update') {
      console.log('update fund family');
    }
    this.popupClose();
  }

  deleteFundContact() {
  //   this.loadingInfo = true;
  //   const params = {
  //     GUID: [this.selectedFundFamilyContactObj.GUID]
  //   };
  //   this.fundService.deleteFundFamilyContactDetailsByIds(params).subscribe((result : any)=>{
  //     if (result && result.IsSuccess) {
  //       this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Fund family information deleted successfully.'});
  //       this.newFundFamilyContactObj = new FundFamilyContactInfo();
  //       this.popupClose();
  //       this.listPageNumber = 1;
  //       this.getFundFamilyContactList();
  //     } else {
  //       this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to delete fund family information'});
  //     }
  //     this.loadingInfo = false;
  //   }, (err: any) => {
  //     this.loadingInfo = false;
  //     this.sharedService.toastMsgAlert({ options: 'alert', msg: 'Unable to delete fund family information'});
  //   });  
  }
}
