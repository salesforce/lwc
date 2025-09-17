import { LightningElement, track, api } from 'lwc';

export default class Parent extends LightningElement {
    label = "90's hits";
    @track
    items = [{ id: 39, name: 'Audio' }];

    @api
    changeLabel() {
        this.label = '2000 hits';
    }

    renderedCallback() {
        window.timingBuffer.push('parent:renderedCallback');
    }
}
