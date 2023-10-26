import { LightningElement } from 'lwc';

export default class AdapterApp extends LightningElement {
    static renderMode = 'light';

    uuid = Math.floor(Math.random() * 1_000_000_000);
    showMe = false;
    showMe2 = true;

    toggle() {
        this.showMe = !this.showMe;
        this.showMe2 = !this.showMe2;
    }
}
