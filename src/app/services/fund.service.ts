import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FundService {
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

  getHeader() {
    return {  /// returns only headers
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  } 


  ///Fund Family Services 
  getFundFamilyDetailsList(data: any){
    return this.https.post(`${this.url}FundFamilies/GetFundFamilyDetailsList`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getFundFamilyDetailsById(data: any){
    return this.https.post(`${this.url}FundFamilies/GetFundFamilyDetailsById`, JSON.stringify(data), this.getHeaderWithToken());
  }

  addFundFamilyDetails(data: any){
    return this.https.post(`${this.url}FundFamilies/AddFundFamilyDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  updateFundFamilyDetails(data: any){
    return this.https.post(`${this.url}FundFamilies/UpdateFundFamilyDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  deleteFundFamilyDetailsByIds(data: any){
    return this.https.post(`${this.url}FundFamilies/DeleteFundFamilyDetailsByIds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  /// Fund Family Contact Services  
  getFundFamilyContactDetailsByFundFamilyId(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/GetFundFamilyContactDetailsByFundFamilyId`, JSON.stringify(data), 
      this.getHeaderWithToken());
  }

  getFundFamilyContactDetailsById(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/GetFundFamilyContactDetailsById`, JSON.stringify(data),
      this.getHeaderWithToken());
  }

  addFundFamilyContactDetails(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/AddFundFamilyContactDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  updateFundFamilyContactDetails(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/UpdateFundFamilyContactDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  deleteFundFamilyContactDetailsByIds(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/DeleteFundFamilyContactDetailsByIds`, JSON.stringify(data),
    this.getHeaderWithToken());
  }

  /// Fund Family Contact Phone Services
  getFundFamilyContactPhonesByFFCId(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/GetFundFamilyContactPhonesByFFCId`, JSON.stringify(data),
    this.getHeaderWithToken());
  }

  addFundFamilyContactPhone(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/AddFundFamilyContactPhone`, JSON.stringify(data), this.getHeaderWithToken());
  }

  updateFundFamilyContactPhone(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/UpdateFundFamilyContactPhone`, JSON.stringify(data), this.getHeaderWithToken());
  }

  deleteFundFamilyContactPhoneByIds(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/DeleteFundFamilyContactPhoneByIds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  ///Fund Family Contact Email Services
  getFundFamilyContactEmailsByFFCId(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/GetFundFamilyContactEmailsByFFCId`, JSON.stringify(data), this.getHeaderWithToken());
  }  

  addFundFamilyContactEmail(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/AddFundFamilyContactEmail`, JSON.stringify(data), this.getHeaderWithToken());
  }

  updateFundFamilyContactEmail(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/UpdateFundFamilyContactEmail`, JSON.stringify(data), this.getHeaderWithToken());
  }

  deleteFundFamilyContactEmailByIds(data: any){
    return this.https.post(`${this.url}FundFamilyContacts/DeleteFundFamilyContactEmailByIds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  ///Sourced Fund Services 
  getSourcedFundListByFundFamilyId(data: any) {
    return this.https.post(`${this.url}SourcedFunds/GetSourcedFundListByFundFamilyId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getSourcedFundsByFundFamilyId(data: any) {
    return this.https.post(`${this.url}SourcedFunds/GetSourcedFundsByFundFamilyId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getSourcedFundDetailsById(data: any) {
    return this.https.post(`${this.url}SourcedFunds/GetSourcedFundDetailsById`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getSourcedFundsByCustomerId(data: any) {
    return this.https.post(`${this.url}SourcedFunds/GetSourcedFundsByCustomerId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  addSourcedFundDetails(data: any) {
    return this.https.post(`${this.url}SourcedFunds/AddSourcedFundDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  updateSourcedFundDetails(data: any) {
    return this.https.post(`${this.url}SourcedFunds/UpdateSourcedFundDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  convertSourcedFundToJunkFund(data: any) {
    return this.https.post(`${this.url}SourcedFunds/ConvertSourcedFundToJunkFund`, JSON.stringify(data), this.getHeaderWithToken());
  }

  downloadSourcedFundDataByFundFamilyId(data: any){
    return this.https.post(`${this.url}SourcedFunds/DownloadSourcedFundDataByFundFamilyId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  ///Pending Fund Services 
  getPendingFundsByFFamilyId(data: any) {
    return this.https.post(`${this.url}PendingFunds/GetPendingFundListByFundFamilyId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getPendingFundsByFundFamilyId(data: any) {
    return this.https.post(`${this.url}PendingFunds/GetPendingFundsByFundFamilyId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getPendingFundDetailsById(data: any) {
    return this.https.post(`${this.url}PendingFunds/GetPendingFundDetailsById`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getPendingFundsByCustomerId(data: any) {
    return this.https.post(`${this.url}PendingFunds/GetPendingFundsByCustomerId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  addPendingFundDetails(data: any) {
    return this.https.post(`${this.url}PendingFunds/AddPendingFundDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  updatePendingFundDetails(data: any) {
    return this.https.post(`${this.url}PendingFunds/UpdatePendingFundDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  deletePendingFundDetailsByIds(data: any) {
    return this.https.post(`${this.url}PendingFunds/DeletePendingFundDetailsByIds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  convertPendingFundToJunkFund(data: any) {
    return this.https.post(`${this.url}PendingFunds/ConvertPendingFundToJunkFund`, JSON.stringify(data), this.getHeaderWithToken());
  }

  convertPendingFundToSourceFund(data: any) {
    return this.https.post(`${this.url}PendingFunds/ConvertPendingFundToSourceFund`, JSON.stringify(data), this.getHeaderWithToken());
  }

  downloadPendingFundDataByFundFamilyId(data: any){
    return this.https.post(`${this.url}PendingFunds/DownloadPendingFundDataByFundFamilyId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  ///Junk Fund Services
  getJunkFundsByFundFamilyId(data: any){
    return this.https.post(`${this.url}JunkFunds/GetJunkFundsByFundFamilyId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getJunkFundDetailsById(data: any){
    return this.https.post(`${this.url}JunkFunds/GetJunkFundDetailsById`, JSON.stringify(data), this.getHeaderWithToken());
  }

  addJunkFundDetails(data: any){
    return this.https.post(`${this.url}JunkFunds/AddJunkFundDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  updateJunkFundDetails(data: any){
    return this.https.post(`${this.url}JunkFunds/UpdateJunkFundDetails`, JSON.stringify(data), this.getHeaderWithToken());
  }

  deleteJunkFundDetailsByIds(data: any){
    return this.https.post(`${this.url}JunkFunds/DeleteJunkFundDetailsByIds`, JSON.stringify(data), this.getHeaderWithToken());
  }

  downloadJunkFundDataByFundFamilyId(data: any){
    return this.https.post(`${this.url}JunkFunds/DownloadJunkFundDataByFundFamilyId`, JSON.stringify(data), this.getHeaderWithToken());
  }
}
