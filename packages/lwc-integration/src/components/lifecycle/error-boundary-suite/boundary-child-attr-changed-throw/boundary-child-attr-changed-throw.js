import { Element } from 'engine';

export default class BoundaryChildAttrChangedThrow extends Element {
    @track state = { error: false, title: "initial" };

    errorCallback(error) {
        this.state.error = true;
    }
    renderedCallback() {
        this.state.title = "new title";
    }
}
