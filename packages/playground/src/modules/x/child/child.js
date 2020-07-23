import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api counter = 0;
}