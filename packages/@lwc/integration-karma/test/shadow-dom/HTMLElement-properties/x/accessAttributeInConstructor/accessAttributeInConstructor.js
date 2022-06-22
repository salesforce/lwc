import { LightningElement } from 'lwc';

export default class MyComponent extends LightningElement {
    constructor() {
        super();
        this.a = this.title;
    }
}
