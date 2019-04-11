import { LightningElement, track } from 'lwc';

export default class NestedChildBoundaryAltViewThrow extends LightningElement {
    @track state = { error: false, title: 'initial' };

    errorCallback() {
        this.state.error = true;
    }
}
