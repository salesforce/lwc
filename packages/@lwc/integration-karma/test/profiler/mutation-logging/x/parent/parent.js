import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api firstName;
    @api lastName;
}
