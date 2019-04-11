import { LightningElement, track } from 'lwc';

export default class NestedBoundaryHost extends LightningElement {
    @track state = { error: false, title: 'initial' };

    errorCallback(error) {
        this.state.error = error;
    }

    renderedCallback() {
        this.state.title = 'post initial';
    }
}
