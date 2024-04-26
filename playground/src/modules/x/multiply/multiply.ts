import { LightningElement, api, track, wire } from 'lwc';
import { multiply } from './wire-adapter';

export default class extends LightningElement {
    @api message: string = '';

    @track inputs = { first: 0, second: 0 };

    // NOTE: Custom wire adapters are not supported on the Salesforce Platform.
    // This is for demonstration purposes only.
    @wire(multiply, { first: '$inputs.first', second: '$inputs.second' }) product = 0;

    handleInput(event: { target: HTMLInputElement }) {
        this.inputs[event.target.name as keyof typeof this.inputs] = +event.target.value;
    }
}
