import { LightningElement, api, track } from 'lwc';

export default class Properties extends LightningElement {
    @track static obj = { value: 0 };
    @api increment() {
        this.obj.value += 1;
    }
}
