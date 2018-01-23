import { Element } from 'engine';

export default class BoundaryChildConstructorThrow extends Element {
    @track state = {};

    errorCallback(error) {
        this.state.error = error;
    }
}
