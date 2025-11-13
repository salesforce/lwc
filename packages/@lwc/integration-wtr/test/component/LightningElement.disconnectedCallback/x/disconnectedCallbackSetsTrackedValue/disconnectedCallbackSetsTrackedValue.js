import { LightningElement, track } from 'lwc';

export default class Child extends LightningElement {
    @track
    state = true;

    disconnectedCallback() {
        this.state = false;
    }
}
