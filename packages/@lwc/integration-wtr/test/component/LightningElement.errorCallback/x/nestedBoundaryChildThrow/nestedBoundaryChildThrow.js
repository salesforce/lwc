import { LightningElement, track } from 'lwc';

export default class NestedBoundaryHost extends LightningElement {
    @track state = { error: false };

    errorCallback(error) {
        this.state.error = error;
    }
}
