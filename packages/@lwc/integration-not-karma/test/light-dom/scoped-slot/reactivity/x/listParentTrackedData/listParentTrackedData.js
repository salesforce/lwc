import { LightningElement } from 'lwc';

export default class extends LightningElement {
    renderedCallback() {
        window.timingBuffer.push('parent:renderedCallback');
    }
}
