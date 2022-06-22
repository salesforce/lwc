import { LightningElement } from 'lwc';

export default class Main extends LightningElement {
    static renderMode = 'light';

    called = false;
    renderedCallback() {
        this.called = true;
    }
}
