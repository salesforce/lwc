import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api lang = 'french';
    @api title = 'bonjour';
}
