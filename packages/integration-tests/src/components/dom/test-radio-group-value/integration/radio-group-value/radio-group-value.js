import { LightningElement, track } from 'lwc';

export default class Issue791 extends LightningElement {
    @track radioButtonValue;

    handleChange(e) {
        this.radioButtonValue = e.target.value;
    }
}
