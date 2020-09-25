import { LightningElement, api } from 'lwc';

export default class App extends LightningElement {
    show = false;
    showFourth = false;

    @api
    triggerIssue() {
        this.show = true;
    }
}
