import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
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

  getStateList() {
    return this.https.get(`${this.url}Common/GetStateList`, this.getHeaderWithToken());
  }

  getCityListByStateId(id: any) {
    return this.https.post(`${this.url}Common/GetCityList`, id,  this.getHeaderWithToken());
  }

  getFundFamilyList() {
    return this.https.get(`${this.url}Common/GetFundFamilyList`,  this.getHeaderWithToken());
  }

  getMilRateOffsetTypeList() {
    return this.https.get(`${this.url}Common/GetMilRateOffsetTypeList`,  this.getHeaderWithToken());
  }

  getNAVOffsetTypeList() {
    return this.https.get(`${this.url}Common/GetNAVOffsetTypeList`,  this.getHeaderWithToken());
  }

  getMonthEndRateBehaviorList() {
    return this.https.get(`${this.url}Common/GetMonthEndRateBehaviorList`,  this.getHeaderWithToken());
  }
  
  getMonthEndRateDirectionList() {
    return this.https.get(`${this.url}Common/GetMonthEndRateDirectionList`,  this.getHeaderWithToken());
  }

  getMonthEndRateTypeList() {
    return this.https.get(`${this.url}Common/GetMonthEndRateTypeList`,  this.getHeaderWithToken());
  }

  getMultiRateDirectionList() {
    return this.https.get(`${this.url}Common/GetMultiRateDirectionList`,  this.getHeaderWithToken());
  }

  getMultiRateTypeList() {
    return this.https.get(`${this.url}Common/GetMultiRateTypeList`,  this.getHeaderWithToken());
  }

  getOmnibusTypeListByFamilyId(data: any) {
    return this.https.post(`${this.url}Common/GetOmnibusTypeListByFamilyId`, JSON.stringify(data), this.getHeaderWithToken());
  }

  getShareClassList(shareClassFundFlag: any) {
    return this.https.post(`${this.url}Common/GetShareClassList`, shareClassFundFlag,  this.getHeaderWithToken());
  }

  getWeekendTypeList() {
    return this.https.get(`${this.url}Common/GetWeekendTypeList`,  this.getHeaderWithToken());
  }

  getPositionList() {
    return this.https.get(`${this.url}Common/GetPositionList`,  this.getHeaderWithToken());
  }

  getDataSourceList() {
    return this.https.get(`${this.url}Common/GetDataSourceList`,  this.getHeaderWithToken());
  }

  getDayTypeList() {
    return this.https.get(`${this.url}Common/GetDayTypeList`,  this.getHeaderWithToken());
  }

  getDepartmentList() {
    return this.https.get(`${this.url}Common/GetDepartmentList`,  this.getHeaderWithToken());
  }

  getLocationTypeList() {
    return this.https.get(`${this.url}Common/GetLocationTypeList`,  this.getHeaderWithToken());
  }

  getPhoneNumberTypeList() {
    return this.https.get(`${this.url}Common/GetPhoneNumberTypeList`,  this.getHeaderWithToken());
  }

  getReasonList() {
    return this.https.get(`${this.url}Common/GetReasonList`,  this.getHeaderWithToken());
  }

  getDividendFrequencyList() {
    return this.https.get(`${this.url}Common/GetDividendFrequencyList`,  this.getHeaderWithToken());
  }

  getPricingSourceList() {
    return this.https.get(`${this.url}Common/GetPricingSourceList`,  this.getHeaderWithToken());
  }

  getStatusList() {
    return this.https.get(`${this.url}Common/GetStatusList`,  this.getHeaderWithToken());
  }

}