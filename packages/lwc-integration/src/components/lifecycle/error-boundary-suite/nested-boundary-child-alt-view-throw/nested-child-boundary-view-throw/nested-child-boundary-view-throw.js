import { Element } from 'engine';

export default class BoundaryChildBoundaryAltViewThrow extends Element {
    @track state = { error: false, title: "initial" };

    errorCallback(error) {
        this.state.error = true;
    }
}
