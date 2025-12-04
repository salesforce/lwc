import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api
    getComponentBoundingClientRect() {
        return this.getBoundingClientRect();
    }
}
