import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api eventCallback;

    handleTest(evt) {
        this.eventCallback(evt);
    }
}
