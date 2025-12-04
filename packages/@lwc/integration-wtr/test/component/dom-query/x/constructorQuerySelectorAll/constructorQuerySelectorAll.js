import { LightningElement } from 'lwc';

export default class ConstructorQuerySelectorAll extends LightningElement {
    constructor() {
        super();
        this.querySelectorAll('div');
    }
}
