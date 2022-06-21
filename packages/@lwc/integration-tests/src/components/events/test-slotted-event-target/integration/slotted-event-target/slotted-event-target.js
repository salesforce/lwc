import { LightningElement, track } from 'lwc';

export default class SlottedEventTarget extends LightningElement {
    @track targetIsSelect = false;
    handleChange(evt) {
        this.targetIsSelect = evt.target.tagName.toLowerCase() === 'select';
    }
}
