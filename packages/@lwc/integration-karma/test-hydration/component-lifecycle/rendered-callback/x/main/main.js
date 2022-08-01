import { LightningElement } from 'lwc';

export default class Main extends LightningElement {
    called = false;
    renderedCallback() {
        this.called = true;
    }
}
