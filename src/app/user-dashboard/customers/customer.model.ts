export class SourceFundAddEdit {
    customerId: number;
    fundfamily: string = '';
    fundFamilyId: string =  '';
    fundsrc: string = '';
    fundId: string = '';
    symbol: string = '';
    nav: boolean;
    mil: boolean;
    distributor: boolean;
}

export class LinkedPendingAddEdit {
    CUSIP: string;
    CustomerID: number;
    CustomerSymbol: string = '';
    FundFamilyId: string = '';
    FamilyID: string;
    FundId: string = '';
    FundName: string;
    FundFamilyName: string;
}

export class CustomerAddEdit {
    customerName: string;
    fileDirectory: string;
    email: string;
    startDate = new Date();
    dividentCalendar: boolean;
    navFile: boolean;
    mil: boolean;
    distribution: boolean;
}

export class TableParams {
    pageNumber = 1;
    pageSize = '1000';
    sortOrder = 'Desc';
    sortBy: string;
    totalRecords: number;
}

export class PopupObj {
    show1: boolean;
    type1: string;

    show2: boolean;
    type2: string;
}


export class CustomerListInfo {
    Customer_ID: string;
    Name: string;
    DirectoryPath: string;
    StartDate: string;
    SISServiceID: number;
    FileTransmissionstimes: string;
    CustomerFileTypeID: number;
    FileTransmissionmethod: string;
    Emailaddress: string;
    File_Directory: any;
}

export class CustomerObj {
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    City: string;
    CityId: number;
    ContactId: number;
    ContactName: string;
    CustomerId: number;
    DataSource: string;
    DataSourceId: number;
    Department: string;
    DepartmentId: number;
    EmailAddress: string;
    FaxNumber: string;
    PortalAccess: number;
    Position: string;
    PositionId: number;
    PrimaryPhoneNumber: string;
    State: string;
    StateId: number;
    Title: string;
    TypeOfContact: number;
    ZipCode: number;
}

export enum CustomerServices {
    NAV = "1",
    MilRate = "2",
    Distribution = "3",
    DividendCalendar = "7"
}