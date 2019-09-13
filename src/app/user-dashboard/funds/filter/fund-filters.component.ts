import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { JunkFundFilterModel, FundFamilyContactFilterModel, SourcedFundFilterModel, PendingFundFilterModel } from '../fund.models';

@Component({
  selector: 'app-fund-filters',
  templateUrl: './fund-filters.component.html'
})
export class FundFiltersComponent implements OnInit, OnChanges {

  private _fundFamilyGUID: string;
  @Input() set fundFamilyGUID(value: string) {
    this._fundFamilyGUID = value;
    this.getOmnibusTypeList();
  }

  get fundFamilyGUID(): string {
    return this._fundFamilyGUID;
  }

  @Input() selectedTabView: string;
  @Output() onApplyFilterClick = new EventEmitter<any>();

  filterData = {
    fundFamilyContactFilterData: new FundFamilyContactFilterModel(),
    sourcedFundFilterData: new SourcedFundFilterModel(),
    pendingFundFilterData: new PendingFundFilterModel(),
    junkFundFilterData: new JunkFundFilterModel()
  };

  dropdownList = {
    dataSourceList: [],
    departmentList: [],
    stateList: [],
    locationList: [],
    booleanList: [],
    dividendFrequencyList: [],
    omnibusTypeList: [],
    shareClassList: [],
    statusList: [],
    reasonList: [],
    mergedFndFamilyList: [],
    pricingSourceList: []
  };

  constructor(private commonService: CommonService) {
  }

  ngOnInit() {
    this.getDataSourceList();
    this.getDepartmentList();
    this.getStateList();
    this.getLocationList();
    this.getBooleanList();
    this.getDividendFrequencyList();
    this.getShareClassList();
    this.getStatusList();
    this.getReasonList();
    this.getMergedFundFamilyList();
    this.getPricingSourceList();
  }

  ngOnChanges() {
    this.onApplyFilterClick.emit(this.filterData);
  }

  onApplyFilterBtnClick() {
    this.onApplyFilterClick.emit(this.filterData);
  }

  getDataSourceList() {
    this.commonService.getDataSourceList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.dataSourceList = result.Data;
      }
    });
  }

  getDepartmentList() {
    this.commonService.getDepartmentList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.departmentList = result.Data;
      }
    });
  }

  getStateList() {
    this.commonService.getStateList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.stateList = result.Data;
      }
    });
  }

  getLocationList() {
    this.commonService.getLocationTypeList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.locationList = result.Data;
      }
    });
  }

  getBooleanList() {
    this.dropdownList.booleanList = [
      { "DisplayText": "Yes", "Value": "1" },
      { "DisplayText": "No", "Value": "0" }
    ];
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
    if (this.fundFamilyGUID) {
      const params = {
        GUID: this.fundFamilyGUID
      };
      this.commonService.getOmnibusTypeListByFamilyId(params).subscribe((result: any) => {
        if (result && result.IsSuccess) {
          this.dropdownList.omnibusTypeList = result.Data;
        }
      });
    }
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
        this.dropdownList.mergedFndFamilyList = result.Data;
      }
    });
  }

  getPricingSourceList() {
    this.commonService.getPricingSourceList().subscribe((result: any) => {
      if (result && result.IsSuccess) {
        this.dropdownList.pricingSourceList = result.Data;
      }
    });
  }
}
