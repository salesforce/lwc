import { LightningElement, wire } from 'lwc';
import adapter from './wire';

export default class extends LightningElement {
    static renderMode = 'light';
    @wire(adapter, { value: 'hello' })
    data;

    connectedCallback() {
        this.connectedCallbackProp = this.data.join(', ');
    }
}
