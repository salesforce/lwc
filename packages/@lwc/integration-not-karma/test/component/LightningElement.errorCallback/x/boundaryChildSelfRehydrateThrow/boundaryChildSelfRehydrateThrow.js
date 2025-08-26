import { LightningElement, track } from 'lwc';

export default class BoundaryChildSelfRehydrateThrow extends LightningElement {
    @track state = {};

    errorCallback(error) {
        this.state.error = error;
    }
}
