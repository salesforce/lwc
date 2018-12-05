import { LightningElement, track, api } from 'lwc';

export default class Dummy extends LightningElement {
    @track text = 'before';
    @api
    changeText() {
        this.text = 'after';
    }
}
