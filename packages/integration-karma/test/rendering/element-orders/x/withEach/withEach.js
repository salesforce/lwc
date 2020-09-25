import { LightningElement, api } from 'lwc';

export default class WithEach extends LightningElement {
    show = false;
    showFourth = false;

    @api
    triggerIssue() {
        this.show = true;
    }
}
