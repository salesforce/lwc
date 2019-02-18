import { LightningElement, track } from 'lwc';

export default class BoundaryChildConstructorThrow extends LightningElement {
    @track state = {};

    errorCallback(error) {
        this.state.error = error;
    }
}
