import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class SharedService {


  confirmationPopup = new BehaviorSubject({});
  confirmationPopup$ = this.confirmationPopup.asObservable();

  togglebar = new BehaviorSubject(false);

  toastMsg = new BehaviorSubject({});
  toastMsg$ = this.toastMsg.asObservable();

  userProfile = new BehaviorSubject({});
  userProfile$ = this.userProfile.asObservable();

  loadingIcon = new BehaviorSubject(false);

  customerFilters = {
    contacts : new BehaviorSubject({}),
    sourceFunds: new BehaviorSubject({
      FundId: -1,
      IsDistributionProvided: -1,
      IsMilProvided: -1,
      IsNAVProvided: -1
    }),
    pendingFunds : new BehaviorSubject({
      FundId: -1
    })
  }

  customerContactFilter$ = this.customerFilters.contacts.asObservable();
  customerSourceFundsFilter$ = this.customerFilters.sourceFunds.asObservable();
  customerPendingFundsFilter$ = this.customerFilters.pendingFunds.asObservable();
  
  private notify = new Subject<any>();
  notifyObservable$ = this.notify.asObservable();

  private notifyFundFilter = new Subject<any>(); 
  notifyFundFilterObservable$ = this.notifyFundFilter.asObservable();

  constructor(private route: Router) { }

  public notifyFilter(data: any) {
    if (data) {
      this.notify.next(data);
    }
  }

  /// Set User Infomation On Local Storage as object//
  setUserLocal(data: any) {
    localStorage.setItem('authToken', JSON.stringify(data));
  }

  /// GET User Infomation FROM Local Storage //
  getUserLocal() {
    return (localStorage.getItem('authToken') ? localStorage.getItem('authToken') : '');
  } /// JSON.parse(localStorage.getItem('authToken'))

  callConfirmPopup(data: any) {
    this.confirmationPopup.next(data);
  }

  toastMsgAlert(data: any) {
    this.toastMsg.next(data);
  }

  toggleSideBar(value: any) {
    this.togglebar.next(value); // = !this.togglebar;
  }

  shareUserProfile(data: any) {
    this.userProfile.next(data);
  }

  waitingSign(state: boolean) {
    this.loadingIcon.next(state);
  }

  custNameList() {
    return [
      {name: 'ABC', id: '0870001'},
      {name: 'ABC-00202', id: '40001'},
      {name: 'XYZZZZ', id: '6001'},
      {name: 'ABC3333', id: '2001'},
      {name: 'ABC22221', id: '0938001'},
      {name: 'KKAAA', id: '0011'},
      {name: 'PZRRR', id: '6640001'},
      {name: 'ABC3333', id: '2001'},
      {name: 'ABC22221', id: '0938001'},
      {name: 'KKAAA', id: '0011'},
      {name: 'PZRRR', id: '6640001'},
      {name: 'ABC3333', id: '2001'},
      {name: 'ABC22221', id: '0938001'},
      {name: 'KKAAA', id: '0011'},
      {name: 'PZRRR', id: '6640001'},
      {name: 'ABC3333', id: '2001'},
      {name: 'ABC22221', id: '0938001'},
      {name: 'KKAAA', id: '0011'},
      {name: 'PZRRR', id: '6640001'},
    ];
  }

  fundList() {
    return [
      {name: '2ABC', id: '870001', notification: false},
      {name: 'ABC-0102', id: '10001', notification: true},
      {name: 'XZZZ', id: '26001', notification: false},
      {name: 'ABC8333', id: '2001', notification: false},
      {name: 'ABC221', id: '938001', notification: false},
      {name: 'KKAZAA', id: '30011', notification: true},
      {name: 'PZRRYR', id: '40001', notification: false},
      {name: 'ABC333', id: '42001', notification: false},
      {name: 'ABC221', id: '938001', notification: true},
      {name: 'KZKAAA', id: '70011', notification: false},
      {name: 'PZR$RR', id: '40001', notification: false},
      {name: 'ABC3883', id: '42001', notification: false},
      {name: 'ABC221', id: '38001', notification: false},
      {name: 'SKAAA', id: '60011', notification: true},
      {name: 'RPZRRR', id: '540001', notification: true},
      {name: 'ABC3833', id: '62001', notification: false},
      {name: 'ABC29921', id: '838001', notification: false},
      {name: 'KDEAA', id: '80011', notification: true},
      {name: 'PZCRR', id: '940001', notification: false},
    ];
  }


  contactDetailInfo() {
    return [
      {name: 'ABC', email: 'abc@abc.com', address: 'abcd', state: 'AL', zipcode: '365522', phone: '9895266631', source: 'phone', department: 'pricing'},
      {name: 'XYZZZZ', email: 'zzss@lls.com', address: 'mm', state: 'PL', zipcode: '995522', phone: '96662266631', source: 'email', department: 'pricing'},
      {name: 'PZRRR', email: 'aeee@aaaabc.com', address: 'abttttttttcd', state: 'NY', zipcode: '9987522', phone: '9895266631', source: 'Phone', department: 'pricing'},
      {name: 'KKAAA', email: 'abc@abc.com', address: 'abrrrcd', state: 'AI', zipcode: '365522', phone: '9895266631', source: 'email', department: 'pricing'},
      {name: 'XYZZZZ', email: 'asscsdsbc@abc.com', address: 'abeeeecd', state: 'OL', zipcode: '33', phone: '8323232323', source: 'phone', department: 'pricing'},
      {name: 'PZRRR', email: 'abxxxcx@a.com', address: 'absssssscd', state: 'MZ', zipcode: '225', phone: '6654288855', source: 'feed', department: 'pricing'},
      {name: 'XYZZZZ', email: 'azzzzzzc@absc.com', address: 'abcd', state: 'HW', zipcode: '998555', phone: '3333358944', source: 'phone', department: 'pricing'},
      {name: 'ABC', email: 'abc@abc.com', address: 'abcd', state: 'AL', zipcode: '365522', phone: '9895266631', source: 'email', department: 'pricing'},
      {name: 'XYZZZZ', email: 'zzss@lls.com', address: 'mm', state: 'PL', zipcode: '995522', phone: '96662266631', source: 'phone', department: 'pricing'},
      {name: 'PZRRR', email: 'aeee@aaaabc.com', address: 'abttttttttcd', state: 'NY', zipcode: '9987522', phone: '9895266631', source: 'fax', department: 'pricing'},
      {name: 'KKAAA', email: 'abc@abc.com', address: 'abrrrcd', state: 'AI', zipcode: '365522', phone: '9895266631', source: 'feed', department: 'pricing'},
      {name: 'XYZZZZ', email: 'asscsdsbc@abc.com', address: 'abeeeecd', state: 'OL', zipcode: '33', phone: '8323232323', source: 'email', department: 'pricing'},
      {name: 'PZRRR', email: 'abxxxcx@a.com', address: 'absssssscd', state: 'MZ', zipcode: '225', phone: '6654288855', source: 'email', department: 'pricing'},
      {name: 'XYZZZZ', email: 'azzzzzzc@absc.com', address: 'abcd', state: 'HW', zipcode: '998555', phone: '3333358944', source: 'phone', department: 'pricing'},
      {name: 'ABC', email: 'abc@abc.com', address: 'abcd', state: 'AL', zipcode: '365522', phone: '9895266631', source: 'email', department: 'pricing'},
      {name: 'XYZZZZ', email: 'zzss@lls.com', address: 'mm', state: 'PL', zipcode: '995522', phone: '96662266631', source: 'phone', department: 'pricing'},
      {name: 'PZRRR', email: 'aeee@aaaabc.com', address: 'abttttttttcd', state: 'NY', zipcode: '9987522', phone: '9895266631', source: 'phone', department: 'pricing'},
      {name: 'KKAAA', email: 'abc@abc.com', address: 'abrrrcd', state: 'AI', zipcode: '365522', phone: '9895266631', source: 'fax', department: 'pricing'},
      {name: 'XYZZZZ', email: 'asscsdsbc@abc.com', address: 'abeeeecd', state: 'OL', zipcode: '33', phone: '8323232323', source: 'phone', department: 'pricing'},
      {name: 'PZRRR', email: 'abxxxcx@a.com', address: 'absssssscd', state: 'MZ', zipcode: '225', phone: '6654288855', source: 'phone', department: 'pricing'},
      {name: 'XYZZZZ', email: 'azzzzzzc@absc.com', address: 'abcd', state: 'HW', zipcode: '998555', phone: '3333358944', source: 'email', department: 'pricing'}
    ];
  }


  getSourceFunds() {
    return [
      {sf_name: 'Future Danger', sf_family: 'ABC', cusip: '87448855', cust_symbole: 'ABC1',
        nav: '11.23', mil_rate: '', distributor: '00.77225', equity: '',
        dollorFund: true, comment: 'sssd dsd', cust: 'view', shareclass: 'A', intNo: 120
      },
      { sf_name: 'Present Danger', sf_family: 'XYZ', cusip: '98566555', cust_symbole: 'ZZAW',
        nav: '12.23', mil_rate: '', distributor: '00.65225', equity: '',
        dollorFund: false, comment: 'sssd dsd', cust: 'view', shareclass: 'C', intNo: 210
      },
        {sf_name: 'Future Danger', sf_family: 'ABC', cusip: '87448855', cust_symbole: 'ABC1',
        nav: '11.23', mil_rate: '', distributor: '00.2225', equity: '',
        dollorFund: false, comment: 'sssd dsd', cust: 'view', shareclass: 'C', intNo: 210
      },
        {sf_name: 'Future Danger', sf_family: 'ABC', cusip: '87448855', cust_symbole: 'ABC1',
        nav: '11.23', mil_rate: '', distributor: '00.2225', equity: '',
        dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 110
      },
        {sf_name: 'Future Danger', sf_family: 'ABC', cusip: '87448855', cust_symbole: 'ABC1',
        nav: '11.23', mil_rate: '', distributor: '00.2225', equity: '',
        dollorFund: true, comment: 'sssd dsd', cust: 'view', shareclass: 'A', intNo: 120
      },
        {sf_name: 'Future Danger', sf_family: 'ABC', cusip: '87448855', cust_symbole: 'ABC1',
        nav: '11.23', mil_rate: '', distributor: '00.2225', equity: '',
        dollorFund: true, comment: 'sssd dsd', cust: 'view', shareclass: 'A', intNo: 120
      },
        {sf_name: 'Future Danger', sf_family: 'ABC', cusip: '87448855', cust_symbole: 'ABC1',
        nav: '11.23', mil_rate: '', distributor: '00.2225', equity: '',
        dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 110
      },
        {sf_name: 'Future Danger', sf_family: 'ABC', cusip: '87448855', cust_symbole: 'ABC1',
        nav: '11.23', mil_rate: '', distributor: '00.2225', equity: '',
        dollorFund: false, comment: 'sssd dsd', cust: 'view', shareclass: 'C', intNo: 210
      },
        {sf_name: 'Present Danger', sf_family: 'XYZ', cusip: '98566555', cust_symbole: 'ZZAW',
        nav: '12.23', mil_rate: '', distributor: '00.65225', equity: '',
        dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 110
      },
        {sf_name: 'Present Danger', sf_family: 'XYZ', cusip: '98566555', cust_symbole: 'ZZAW',
        nav: '12.23', mil_rate: '', distributor: '00.65225', equity: '',
        dollorFund: false, comment: 'sssd dsd', cust: 'view', shareclass: 'C', intNo: 210
      },
        {sf_name: 'Present Danger', sf_family: 'XYZ', cusip: '98566555', cust_symbole: 'ZZAW',
        nav: '12.23', mil_rate: '', distributor: '00.65225', equity: '',
        dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 110
      },
        {sf_name: 'Present Danger', sf_family: 'XYZ', cusip: '98566555', cust_symbole: 'ZZAW',
        nav: '12.23', mil_rate: '', distributor: '00.65225', equity: '',
        dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 110
      },
    ];
  }

  getPendingFunds() {
    return [
      {fund_name: 'Stasjjsd sj', fund_family: 'XYZ', cusip: '9116555', cust_symbole: 'ZZAW',
        nav: '12.23', mil_rate: '', dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 110
      },
      {fund_name: 'Pkkhs sj', fund_family: 'PQEE', cusip: '9516555', cust_symbole: 'PQAW',
        nav: '12.23', mil_rate: '', dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 210},
      {fund_name: 'PUsdsh dsj', fund_family: 'PUU', cusip: '6416555', cust_symbole: 'PUAW',
        nav: '12.23', mil_rate: '', dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 310},
      {fund_name: 'Ntahs ss', fund_family: 'NHTT', cusip: '356555', cust_symbole: 'ZZAW',
        nav: '12.23', mil_rate: '', dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 211},
      {fund_name: 'Xoosdh s', fund_family: 'XYZ', cusip: '3616555', cust_symbole: 'PPA',
        nav: '12.23', mil_rate: '', dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 130},
      {fund_name: 'Gharsk s', fund_family: 'GARR', cusip: '9116555', cust_symbole: 'GAAW',
        nav: '12.23', mil_rate: '', dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 410},
      {fund_name: 'Sooaj', fund_family: 'AXYZ', cusip: '75116555', cust_symbole: 'AZAW',
        nav: '12.23', mil_rate: '', dollorFund: true, comment: 'ssgggs s', cust: 'view', shareclass: '', intNo: 212}
    ]
  }

  customerDetailsInfo() {
    return [
      {id: '156', name: 'ABC'},
      {id: '158', name: 'XYZ'},
      {id: '160', name: 'PQR'},
    ];
  }

  setCustomerContactsFilter(){
    this.customerFilters.contacts.next(null);
  }

  setCustomerSourceFundsFilter(){
    this.customerFilters.sourceFunds.next(null);
  }

  setCustomerPendingFundsFilter(){
    this.customerFilters.pendingFunds.next(null);
  }

  clearedCustomerFilterData(seletedTab){

    switch(seletedTab){
      case "contacts" : 
        return  {
            DataSourceId : -1,
            DepartmentId: -1,
            State: -1,
            City: -1
          };
      break;

      case "sourceFunds" :
          return {
            FundId: -1,
            IsDistributionProvided: -1,
            IsMilProvided: -1,
            IsNAVProvided: -1
          }
      break;

      case "pendingFunds" :
          return {
            FundId: -1
          }
      break;

      case "all" :
          return  {
            contacts : {
              DataSourceId : -1,
              DepartmentId: -1,
              State: -1,
              City: -1
            },
            sourceFunds: {
              FundId: -1,
              IsDistributionProvided: -1,
              IsMilProvided: -1,
              IsNAVProvided: -1
            },
            pendingFunds : {
              FundId: -1
            }
          }
      break;
    }
  }

}
