import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    @api items;

    renderedCallback() {
        window.timingBuffer.push('child:renderedCallback');
    }
}
