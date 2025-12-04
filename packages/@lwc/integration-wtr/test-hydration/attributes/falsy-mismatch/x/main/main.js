import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    @api isFalse;
    @api isUndefined;
    @api isNull;
    @api isTrue;
    @api isEmptyString;
    @api isZero;
    @api isNaN;
}
