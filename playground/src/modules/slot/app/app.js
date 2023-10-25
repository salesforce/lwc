import { LightningElement } from 'lwc';

export default class AdapterApp extends LightningElement {
    // static renderMode = 'light';
    showMe = true;
    toggle() {
        this.showMe = !this.showMe;
    }
}
