import { LightningElement, track } from 'lwc';

export default class ChangeEventComposed extends LightningElement {
    @track notComposed = false;
    handleChange(evt) {
        this.notComposed = evt.composed === false;
    }
}
