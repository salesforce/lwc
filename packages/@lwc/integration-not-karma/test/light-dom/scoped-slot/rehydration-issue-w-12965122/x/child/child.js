import { LightningElement, api, track } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    @track
    items = [{ id: 1, name: 'Fiat' }];

    @api
    changeLabel() {
        this.items[0].name = 'Peugeot';
    }

    renderedCallback() {
        window.timingBuffer.push('child:renderedCallback');
    }
}
