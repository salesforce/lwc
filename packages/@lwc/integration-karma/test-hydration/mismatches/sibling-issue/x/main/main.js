import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    @api showMe;

    renderedCallback() {
        this.showMe = false;
    }
}
