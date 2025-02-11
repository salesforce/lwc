import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    @api greeting;
    dynamic = '1';
}
