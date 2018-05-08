import { Element, track } from 'engine'

export default class BoundaryChildConnectedThrow extends Element {
    @track state = {};

    errorCallback(error) {
        this.state.error = error;
    }
}
