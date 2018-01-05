import { Element, track } from 'engine'

export default class BoundaryChildRenderThrow extends Element {
    @track state = {};

    errorCallback(error) {
        this.state.error = error;
    }
}
