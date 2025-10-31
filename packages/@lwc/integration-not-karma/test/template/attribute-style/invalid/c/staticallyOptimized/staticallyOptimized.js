import { LightningElement, api } from 'lwc';

export default class Dynamic extends LightningElement {
    @api showObj = false;
    @api showNum = false;
    @api showBool = false;

    styleObj = {};
    styleBool = true;
    styleNum = 1;
}
