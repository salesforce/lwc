import { Element } from 'engine'

export default class BoundaryChildSelfRehydrateThrow extends Element {
    @track state = {};

    errorCallback(error) {
        this.state.error = error;
    }
}
