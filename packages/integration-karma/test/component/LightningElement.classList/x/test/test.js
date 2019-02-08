import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api getClassList() {
        return this.classList;
    }
}
