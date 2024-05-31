import { LightningElement, api } from 'lwc';

export default class App extends LightningElement {
    show = true;

    @api
    toggleSpans() {
        this.show = !this.show;
    }
}
