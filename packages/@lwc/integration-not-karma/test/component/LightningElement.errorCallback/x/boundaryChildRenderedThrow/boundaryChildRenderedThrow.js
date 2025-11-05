import { LightningElement, track } from 'lwc';

export default class BoundaryChildRenderedThrow extends LightningElement {
    @track state = {};

    errorCallback(error) {
        this.state.error = error;
    }
}
