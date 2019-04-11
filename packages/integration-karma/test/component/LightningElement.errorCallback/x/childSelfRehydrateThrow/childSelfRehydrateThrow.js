import { LightningElement, track, api } from 'lwc';

export default class ChildRenderThrow extends LightningElement {
    @track counter = 1;
    get getCounter() {
        return this.counter;
    }
    renderedCallback() {
        if (this.counter === 2) {
            throw new Error('Child thew an error during rendered callback');
        }
    }
    @api
    incrementCounter() {
        this.counter++;
    }
}
