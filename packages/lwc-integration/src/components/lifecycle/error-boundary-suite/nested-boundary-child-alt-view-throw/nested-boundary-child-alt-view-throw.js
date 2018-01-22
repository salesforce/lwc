import { Element, track } from 'engine';

export default class NestedBoundaryHost extends Element {
    @track state = { error: false, title: "initial" };

    errorCallback(error) {
        this.state.error = error;
    }

    renderedCallback() {
        this.state.title = "post initial";
    }
}
