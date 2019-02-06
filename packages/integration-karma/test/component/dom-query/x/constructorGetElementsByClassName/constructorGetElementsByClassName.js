import { LightningElement } from 'lwc';

export default class ConstructorGetElementsByClassName extends LightningElement {
    constructor() {
        super();
        this.getElementsByClassName('foo');
    }
}
