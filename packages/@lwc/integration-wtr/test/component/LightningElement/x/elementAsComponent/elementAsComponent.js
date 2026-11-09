import { LightningElement } from 'lwc';

export default class ReturningScript extends LightningElement {
    constructor() {
        super();
        const div = document.createElement('div');
        LightningElement.call(div);
        return div;
    }
}
