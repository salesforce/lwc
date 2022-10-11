import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api showIf = false;
    @api showElseif = false;
}
