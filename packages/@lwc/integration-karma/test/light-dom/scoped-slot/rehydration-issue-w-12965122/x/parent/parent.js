import { LightningElement, api, track } from 'lwc';

let counter = 0;
export default class Parent extends LightningElement {
    constructor() {
        super();
        counter = 0;
    }
    @track
    attr = { label: 'Parent' };
    @api changeAttr() {
        this.attr = { label: 'Parent' + counter++ };
    }
    @api flag = false;

    renderedCallback() {
        window.timingBuffer.push('parent:renderedCallback');
    }
}
