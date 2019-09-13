export class FundFamilyInfo{
    Name: string;
    Comments: string;
    AllowSort: boolean;
    WeekendType: string = '';
    NavOffset: string = '';
    MilRateOffset: string = '';
    NewLinkedSharedClassList = [];
    UnlinkedShareClassList: any;
    LinkedShareClassList: any;
    GUID: string;
    Id: number;
}

export class FundFamilyContactInfo {
    Name: string;
    Position: string;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    StateName: string;
    StateId: number;
    CityId: number;
    ZipCode: string;
    Location: string;
    Days: string;
    Hours: Hours;
    HoursToShow: string;
    PrimaryPhone: string;
    PhoneList:Array<FundFamilyContactPhone>;
    PrimaryEmailAddress: string;
    EmailList:Array<FundFamilyContactEmail>;
    SortOrder: number;
    DataSourceId: number;
    DataSourceName: string;
    DepartmentId: number;
    DepartmentName: string;
    FundFamilyGUID: string;
    GUID: string;
    Id: number;
}

export class Hours{
    Starts: string;
    Ends: string;
}

export class FundFamilyContactPhone{
    Type:string;
    Number:Phone;
    Extension:string;
}

export class Phone{
    AreaCode: string;
    Prefix: string;
    Suffix: string;
}

export class FundFamilyContactEmail{
    Email:string;
}

export class FundFamilyContactFilterModel {   
    SearchText: string = ''; 
    DataSource: string = '';
    Deparments:string = '';
    StateId:number = 0;
    Location:string = '';
}

export class SourcedFundFilterModel {   
    SearchText: string = ''; 
    IsDollarFund: boolean = null;
    IsNavUsed:boolean = null;
    DividendFrequencyGUID:string = null;
    ShareClassGUID:string = null;
    OmnibusTypeGUID:string = null;
    HasCorporateAction:boolean = false;
}

export class PendingFundFilterModel {   
    SearchText: string = ''; 
    IsDollarFund: boolean = null;
    IsMilRateUsed:boolean = null;
    IsNavUsed:boolean = null;
    IsFundTrading:boolean = null;
    TradingStartDate:string = null;
    PricingSourceId:number = null;
    DividendFrequencyGUID:string = null;
    StatusId:number = null;
}

export class JunkFundFilterModel { 
    SearchText: string = '';   
    MergedFundFamilyGUID: string = null;
    ReasonId:number= 0;
}

export class PagerInfo{    
    PageNumber: number = 1;
    PageSize: number = 100;
    SortOrder: string = 'Desc';
    SortBy: string = null;
    TotalRecords: number;
}

export class AddressList{
    line1: string; 
    line2: string;
    line3: string;
}


export class DropDownObj {
    weekendTypeList = [];
    navOffsetTypeList = [];
    milRateOffsetTypeList = [];
    shareClassList = [];
    selectedOmnibusList = [];
    deselectOmnibusList = [];
    unlinkOmnibusListRecords = [];
    searchLinkRecords = '';
}