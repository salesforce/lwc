import { LightningElement, track } from 'lwc';

export default class Test extends LightningElement {
    @track focusInCalled = false;
    handleFocusIn() {
        this.focusInCalled = true;
    }
}
