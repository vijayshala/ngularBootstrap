import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-distributions',
  templateUrl: './distributions.component.html',
  styleUrls: ['./distributions.component.css']
})
export class DistributionsComponent implements OnInit {

  defaultPopups: any = { defaultPP: false, type: '' };
  distCustomerViewPop: any = {distCustomerViewPop:false, type:''};

  constructor() { }

  ngOnInit() {    
  }
  popupClose(param: string) {
    this.defaultPopups = { defaultPP: false, type: '' };
  }

}
