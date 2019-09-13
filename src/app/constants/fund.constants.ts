import { Injectable } from '@angular/core';

@Injectable()
export class FundConstants {

    mergerFundID: string;
    mergerReasonID: string;

    constructor() {
        this.mergerFundID = '1';
        this.mergerReasonID = '1';
    }
}