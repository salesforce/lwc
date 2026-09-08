import { LightningElement, api } from 'lwc';

export default class Attrs extends LightningElement {
    @api cssClass = 'initial';
    @api titleText = 'hello';
}
