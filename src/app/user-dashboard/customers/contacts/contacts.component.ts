import { Component, OnInit, Input, OnChanges, OnDestroy, ɵConsole } from '@angular/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { CustomerService } from 'src/app/services/customer.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() customerId: number;
  @Input() contactFilter: any;

  callApi: boolean; // temporary fix for duplicate
  contactDataArray: any = [];
  editedContact: any;
  selectedContacts = [];
  contactForm = new FormGroup({});
  toggleState: boolean;
  searchText: string = "";
  custPopups: any = { contactPP: false, type: '' };
  loadingInfo: boolean;
  alertMsg: any = { show: false, msg: '' };
  waitForCityList: boolean;
  alertSubsCC: Subscription;
  filterSubscription: Subscription;
  toggleSubscription: Subscription;
  contactPageNo: number = 1;

  pagerObj = {sort: 'ASC', field: 'First_Name', recordLimit: '100'};

  dropdownList = {
    departmentList: [],
    dataSourceList: [],
    typeOfContact: [],
    stateList: [],
    cityList: [],
    positionList: []
  };


  constructor(private sharedservice$: SharedService, private customerService: CustomerService, private commonService: CommonService) { }

  ngOnInit() {
    this.contactPageNo = 1;
    this.searchText = '';
    this.createContactForm();
    this.callApi = false;

    this.toggleSubscription = this.sharedservice$.togglebar.asObservable().subscribe((res: any) => {
      this.toggleState = res;
    });

    this.filterSubscription = this.sharedservice$.customerContactFilter$.subscribe((result: any) => {
      // Discard the input of subscription as data is being passed as input parameter
      this.getCustomerContactList();
    });

    this.alertSubsCC = this.sharedservice$.confirmationPopup$.subscribe((res: any) => {
      // console.log('contacttttt', res)
        if (res.hasOwnProperty('options') && res.options === 'close') {
          if (res.callfrom === 'contact' && res.type === 'delete-list') {
            this.callApi = false;
            this.deleteContactList();
          }
          if (res.callfrom === 'contact' && res.type === 'delete') {
            this.callApi = false;
            this.deleteContact();
          }
          if (res.callfrom === 'contact' && res.type === 'add') {
            this.callApi = false;
            this.addContactApi();
          }
          if (res.callfrom === 'contact' && res.type === 'update') {
            this.callApi = false;
            this.addContactApi();
          }
        }

    });

    this.getPositions();
    this.getDeptList();
    this.getDataSrcList();
    this.gettypeOfContacts();
    this.getStates();

  }

  ngOnDestroy() {
    this.sharedservice$.callConfirmPopup({});
    this.filterSubscription.unsubscribe();
    this.alertSubsCC.unsubscribe();
    this.toggleSubscription.unsubscribe();
  }

  ngOnChanges() {
    this.selectedContacts = [];
    this.searchText = '';
    this.getCustomerContactList();
  }

  checkForAlpaNumeric(event: any) {
    const pattern = /^[\w\s]$/; const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  sortTableData(colm: string) {
    this.pagerObj.field = colm;
    if (this.pagerObj.sort === 'ASC') {
      this.pagerObj.sort = 'DESC';
    } else {
      this.pagerObj.sort = 'ASC';
    }
    this.getCustomerContactList();
  }


  createContactForm() {
    this.contactForm = new FormGroup({
      contactId: new FormControl(''),
      typofcontact: new FormControl('', [Validators.required]),
      contactPosition: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.maxLength(50), this.noWhitespace]),
      dataSource: new FormControl('', [Validators.required]), dataDept: new FormControl('', [Validators.required]),
      phoneno: new FormControl('', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
      email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]),
      address1: new FormControl(''), address2: new FormControl(''), address3: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      pincode: new FormControl(''),
      accessType: new FormControl('')
    });
  }

  // check white space at initial
  public noWhitespace(control: FormControl) {
    let isWhitespace = (control.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
  }

  popupClose(param: string) {
    this.custPopups = { contactPP: false, type: '' };
  }

  searchContacts(isSearchClicked: boolean) {
    if (isSearchClicked)
      this.contactPageNo = 1;
    this.getCustomerContactList();
  }

  getCustomerContactList() {
    // console.log('tetststs')
    this.loadingInfo = true;
    const params = {
      CustomerID: this.customerId,
      SearchText: this.searchText,
      Pager: {
        PageNumber: this.contactPageNo,
        PageSize: this.pagerObj.recordLimit,
        SortOrder: this.pagerObj.sort,
        SortBy: this.pagerObj.field // 'First_Name',
      },
      DataSourceId: this.contactFilter && this.contactFilter.DataSourceId ? this.contactFilter.DataSourceId : -1,
      DepartmentId: this.contactFilter && this.contactFilter.DepartmentId ? this.contactFilter.DepartmentId : -1,
      State: this.contactFilter && this.contactFilter.State ? this.contactFilter.State : -1,
      City: this.contactFilter && this.contactFilter.City ? this.contactFilter.City : -1,
    };
    this.customerService.getCustomerContacts(params).subscribe((result: any) => {
      if (result && result['IsSuccess']) {
        this.alertMsg = { show: false, msg: '' };
        this.contactDataArray = result['Data']['List'];
      } else {
        this.contactDataArray = [];
        this.alertMsg = { show: true, msg: 'No contacts to display' };
      }
      this.loadingInfo = false;
    }, (error: any) => {
      this.contactDataArray = []; this.loadingInfo = false;
    });

  }

  resetContactInformation(t: string) {
    this.setContactFormValues(t, this.editedContact);
  }

  setContactFormValues(t: string, data: any) {
    if (t === 'add') {
      this.createContactForm();
    } else if (t === 'edit' && data) {
      this.contactForm.setValue({
        contactId: data.ContactID,
        typofcontact: data.ContactType.ID,
        contactPosition: data.Position.ID,
        title: data.Title,
        name: data.ContactName,
        dataSource: data.DataSource.ID,
        dataDept: data.Department.ID,
        phoneno: data.PrimaryPhoneNumber,
        email: data.EmailAddress,
        address1: data.AddressLine1, address2: data.AddressLine2, address3: data.AddressLine3,
        city: (data.City.ID ? data.City.ID : ''),
        state: (data.State.ID ? data.State.ID : ''),
        pincode: data.ZipCode, accessType: ''
      });
      this.getCityList(data.State.ID);
    }
  }


  populateContactInformation(actionType: string, contact: any) {
    this.selectedContacts = [];
    this.custPopups = { contactPP: true, type: actionType };
    this.setContactFormValues(actionType, contact);
    this.editedContact = contact;
  }

  getDeptList() {
    this.commonService.getDepartmentList().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.departmentList = result['Data'];
      }
    });
  } //

  getPositions() {
    this.commonService.getPositionList().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.positionList = result['Data'];
      }
    });
  }

  getDataSrcList() {
    this.commonService.getDataSourceList().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.dataSourceList = result['Data'];
      }
    });
  }

  gettypeOfContacts() {
    this.customerService.getTypeOfContactList().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.typeOfContact = result['Data'];
      }
    });
  }

  getStates() {
    this.commonService.getStateList().subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.stateList = result['Data'];
      }
    });
  }

  onStateSelection(evt: any) {
    if (evt.target.value) {
      this.getCityList(evt.target.value);
    }
  }

  getCityList(id: string) {
    this.waitForCityList = true;
    this.commonService.getCityListByStateId(id).subscribe((result: any) => {
      if (result['IsSuccess']) {
        this.dropdownList.cityList = result['Data'];
      }
    }, (err) => { }, () => {
      this.waitForCityList = false;
    });
  }

  toggleFilterSidebar() {
    this.toggleState = !this.toggleState;
    this.sharedservice$.toggleSideBar(this.toggleState);
  }


  deleteContacts() {
    this.callApi = true;
    this.sharedservice$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'contact', type: 'delete-list', customHeader: 'delete contacts',
      message: `Are you sure you want to delete selected contacts? click 'Remove' to delete and 'Cancel' to discard`
    });
    // this.selectedContacts = [];
  }

  deleteContactList() {
    // this.selectedContacts = [];
    this.deleteContactApi(this.getSelectedContact());
  }

  deleteContact() {
    let contactList = [];
    contactList.push(this.contactForm.value.contactId);
    this.deleteContactApi(contactList);
  }

  addNewContact() {
    this.callApi = true;
    this.sharedservice$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'contact', type: 'add',
      message: `Are you sure you want to add this contact? click 'Add' to add contact and 'Cancel' to discard`
    });
  }

  editContactInfo() {
    this.callApi = true;
    this.sharedservice$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'contact', type: 'update',
      message: `Are you sure you want to update this contact details? click 'update' to update contact and 'Cancel' to discard`
    });
  }

  deleteContactInfo() {
    this.callApi = true;
    this.sharedservice$.callConfirmPopup({
      options: 'open', show: true, callfrom: 'contact', type: 'delete',
      message: `Are you sure you want to delete this contact? click 'Delete' to delete contact and 'Cancel' to discard`
    });
  }

  getSelectedContact(): any {
    let contactIDList = [];
    console.log(this.selectedContacts);
    this.selectedContacts.forEach(contact => {
      contactIDList.push(contact.ContactID);
    });
    return contactIDList;
  }

  deleteContactApi(contactList: any) {
    this.loadingInfo = true;
    const params = {
      IntegerList: contactList
    };
   //  console.log(params)
    this.customerService.deleteCustomerContact(params).subscribe((res: any) => {
      if (res['IsSuccess']) {
        // this.contactPageNo = 1;
        this.getCustomerContactList();
        this.selectedContacts = [];
        this.alertMsg = { show: true, msg: 'Contact deleted successfully.' };
        this.sharedservice$.toastMsgAlert({ options: 'alert', msg: 'Contact deleted successfully.' });
        // this.createContactForm();
        this.popupClose('ts');
      }
    }, (err) => {
      console.log(err);
    }, () => {
      this.loadingInfo = false;
    });
  }

  /// Add or Update Customer information API call //
  addContactApi() {
    this.loadingInfo = true;
    this.sharedservice$.waitingSign(true);
    const params = {
      ContactID: (this.custPopups.type === 'edit' ? this.contactForm.value.contactId : ''),
      CustomerID: this.customerId,
      Position: { ID: this.contactForm.value.contactPosition },
      ContactType: { ID: this.contactForm.value.typofcontact },
      Title: this.contactForm.value.title,
      ContactName: this.contactForm.value.name,
      DataSource: { ID: this.contactForm.value.dataSource },
      Department: { ID: this.contactForm.value.dataDept },
      PrimaryPhoneNumber: this.contactForm.value.phoneno,
      EmailAddress: this.contactForm.value.email,
      AddressLine1: this.contactForm.value.address1,
      AddressLine2: this.contactForm.value.address2,
      AddressLine3: this.contactForm.value.address3,
      State: { ID: this.contactForm.value.state },
      City: { ID: this.contactForm.value.city },
      ZipCode: this.contactForm.value.pincode,
    };
    // console.log(params)
    this.customerService.addUpdateCustContact(params).subscribe((res: any) => {

      let message = "Contact added successfully.";
      if (res['IsSuccess']) {
        this.contactPageNo = 1;
        this.getCustomerContactList();
        if (this.custPopups.type === 'edit') {
          message = "Contact updated successfully."
        } else {
          message = res['Message'];
        }
        this.alertMsg = { show: true, msg: message };
        this.sharedservice$.toastMsgAlert({ options: 'alert', msg: message });

        this.createContactForm();
        this.popupClose('ts');
      } else {
        console.warn('failed')
      }
    }, (err) => {
      console.log(err);
    }, () => {
      this.loadingInfo = false;
      this.sharedservice$.waitingSign(false);
    });

  }


  downloadCustomerContactsInFile() {
    this.sharedservice$.waitingSign(true);
    const params = {
      CustomerID: this.customerId,
      SearchText: this.searchText,
      Pager: {
        PageNumber: this.contactPageNo,
        PageSize: this.pagerObj.recordLimit,
        SortOrder: this.pagerObj.sort,
        SortBy: this.pagerObj.field // 'First_Name',
      },
      DataSourceId: this.contactFilter && this.contactFilter.DataSourceId ? this.contactFilter.DataSourceId : -1,
      DepartmentId: this.contactFilter && this.contactFilter.DepartmentId ? this.contactFilter.DepartmentId : -1,
      State: this.contactFilter && this.contactFilter.State ? this.contactFilter.State : -1,
      City: this.contactFilter && this.contactFilter.City ? this.contactFilter.City : -1,
    };

    // window.open(`https://quodd-operational-portal-api.azurewebsites.net/api/CustomerContacts/DownloadCustomerContactList`, '_self');

    // window.open(environment.BaseApiUrl + '/media/DownloadRecording?cameraId=' + this.multiCameraId +
    // '&recordingId=' + this.multiRecordId, '_self'); 

    // this.customerService.downloadCustomerContacts(params).subscribe((res: any) => {
    //   console.log(res);
    //   const newBlob = new Blob([res], { type: 'application/pdf' });
    //   if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    //     window.navigator.msSaveOrOpenBlob(newBlob);
    //     return;
    //   }


    // }, (err) => {
    //   console.warn('download error', err);
    // this.sharedservice$.waitingSign(false);
    // }, () => {
    // this.sharedservice$.waitingSign(false);
    // });
  }


}
