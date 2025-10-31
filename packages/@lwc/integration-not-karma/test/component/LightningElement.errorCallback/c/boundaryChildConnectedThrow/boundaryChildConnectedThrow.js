import { LightningElement, track } from 'lwc';

export default class BoundaryChildConnectedThrow extends LightningElement {
    @track state = {};

    errorCallback(error) {
        this.state.error = error;
    }
}
