import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    @api classes;
    @api styles;
    @api attrs;
}
