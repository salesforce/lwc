import { LightningElement, track } from 'lwc';

export default class BoundaryChildRenderThrow extends LightningElement {
    @track state = {};
    errorCallback(error) {
        this.state.error = error;
    }
}
