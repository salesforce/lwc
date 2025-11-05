import { LightningElement } from 'lwc';

export default class ConstructorQuerySelector extends LightningElement {
    constructor() {
        super();
        this.querySelector('div');
    }
}
