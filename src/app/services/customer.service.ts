import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  url = environment.baseurl;

  constructor(private https: HttpClient) { }

  getHeaderWithToken(): any {
    return {
      headers: new HttpHeaders({  /// returns headers with token //
        'Content-Type': 'application/json',
        Authorization:  localStorage.getItem('authToken') ? 'Bearer ' + localStorage.getItem('authToken') : ''
      })
    };
  }

  getHeaderWithTokenMultipart(): any {
    return {
      headers: new HttpHeaders({  /// returns headers with token //
        // 'Content-Type': 'multipart/form-data',
         
        Authorization:  localStorage.getItem('authToken') ? 'Bearer ' + localStorage.getItem('authToken') : ''
      })
    };
  }


  getHeader() {
    return {  /// returns only headers
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  }

  ///Fund Realted Methods
  getCustomersByPendingFundId(params: any) {
    return this.https.post(`${this.url}Customer/GetCustomersByPendingFundId`, JSON.stringify(params), this.getHeaderWithToken());
  }

  getCustomersBySourcedFundId(params: any) {
    return this.https.post(`${this.url}Customer/GetCustomersBySourcedFundId`, JSON.stringify(params), this.getHeaderWithToken());
  }

  /// Customer List
  getCustomers(params: any) {
    return this.https.post(`${this.url}Customer/GetCustomerList`, JSON.stringify(params), this.getHeaderWithToken());
  }

  /// Add - Update Customer Infomation
  addUpdateCustomer(params: any) {
    return this.https.post(`${this.url}Customer/AddUpdateCustomer`, JSON.stringify(params), this.getHeaderWithToken());
  }

  /// DELETE Customer Details
  deleteCustomers(param: any) {
    return this.https.post(`${this.url}Customer/DeleteCustomers`, JSON.stringify(param), this.getHeaderWithToken());
  }

  addAssertMasterImportFile(data: any) {
    return this.https.post(`${this.url}AssetMasterImport/AssetMasterImportData`, data, this.getHeaderWithTokenMultipart());
  }

  //// Get Customer Contacts List //
  getCustomerContacts(data: any) {
    return this.https.post(`${this.url}CustomerContacts/GetCustomerContactList`, JSON.stringify(data), this.getHeaderWithToken());
  }

  addUpdateCustContact(data: any) {
    return this.https.post(`${this.url}CustomerContacts/AddUpdateCustomerContact`, JSON.stringify(data), this.getHeaderWithToken());
  }

  deleteCustomerContact(idList: any) {
    return this.https.post(`${this.url}CustomerContacts/DeleteCustomerContact`, idList, this.getHeaderWithToken());
  }
/// ----------------
  downloadCustomerContacts(data: any) {
    return this.https.post(`${this.url}CustomerContacts/DownloadCustomerContactList`, JSON.stringify(data),
       this.getHeaderWithToken());
  }

  getTypeOfContactList() {
    return this.https.post(`${this.url}CustomerContacts/GetTypeOfContactList`, '',  this.getHeaderWithToken());
  }

  /// Customer Linked Source Funds LIST
  getLinkedSourceFunds(data: any) {
    return this.https.post(`${this.url}CustomerSourceFunds/GetLinkedCustomerSourceFundsList`,
      JSON.stringify(data), this.getHeaderWithToken());
  }

  // getSourcedFundsByFFamilyId(){
  //   return this.https.get(`${this.url}PendingFunds/GetPendingFundsByFundFamilyId`,  this.getHeaderWithToken());
  // }
   // Link/Update Source Funds 
  linkCustomerSourceFund(data: any) {
    return this.https.post(`${this.url}CustomerSourceFunds/LinkCustomerSourceFunds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  unlinkCustSourceFund(data: any) {
    return this.https.post(`${this.url}CustomerSourceFunds/UnlinkCustomerSourceFunds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getUnlinkCustomerSourceFundList(data: any) {
    return this.https.post(`${this.url}SourcedFunds/GetUnlinkedCustomerSourceFunds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  /// Customer Linked Pending Funds LIST
  getLinkedPendingFunds(data: any) {
    return this.https.post(`${this.url}CustomerPendingFunds/GetLinkedCustomerPendingFundsList`, JSON.stringify(data),
      this.getHeaderWithToken());
  }

  // getPendingFundsByFFamilyId() {
  //   return this.https.get(`${this.url}PendingFunds/GetPendingFundsByFundFamilyId`,  this.getHeaderWithToken());
  // }

// Link/Update Pending Funds
  linkCustomerPendingFund(data: any) {
    return this.https.post(`${this.url}CustomerPendingFunds/LinkCustomerPendingFunds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  unlinkCustPendingFund(data: any) {
    return this.https.post(`${this.url}CustomerPendingFunds/UnlinkCustomerPendingFunds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getUnlinkCustomerPendingFundList(data: any) {
    return this.https.post(`${this.url}PendingFunds/GetUnlinkedCustomerPendingFunds`, JSON.stringify(data), this.getHeaderWithToken());
  }


}
