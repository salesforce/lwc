import { LightningElement } from 'lwc';

export default class Main extends LightningElement {
    called = false;
    connectedCallback() {
        this.called = true;
    }
}
