import { LightningElement, api } from 'lwc';

export default class PublicMethods extends LightningElement {
    @api foo() {}
    @api bar() {}
}
