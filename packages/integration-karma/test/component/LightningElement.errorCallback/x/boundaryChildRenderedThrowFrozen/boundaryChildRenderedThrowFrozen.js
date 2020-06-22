import { LightningElement } from 'lwc';

export default class ChildRenderedThrow extends LightningElement {
    didError = false;
    errorCallback() {
        this.didError = true;
    }
}
