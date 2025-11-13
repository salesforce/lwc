import { LightningElement } from 'lwc';

export default class Main extends LightningElement {
    static renderMode = 'light';

    called = false;
    connectedCallback() {
        this.called = true;
    }
}
