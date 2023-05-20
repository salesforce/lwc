import { LightningElement, track } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    @track
    items = [{ id: 1, name: 'Fiat' }];

    renderedCallback() {
        window.timingBuffer.push('child:renderedCallback');
    }
}
