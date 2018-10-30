import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    get divId() {
        return this.id;
    }
}
