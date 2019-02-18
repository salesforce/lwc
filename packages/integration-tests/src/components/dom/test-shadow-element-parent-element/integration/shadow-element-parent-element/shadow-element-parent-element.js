import { LightningElement, track } from 'lwc';

export default class ShadowElementParentElement extends LightningElement {
    @track parentIsRoot = false;

    renderedCallback() {
        if (this.parentIsRoot === true) {
            return;
        }
        this.parentIsRoot = this.template.querySelector('div').parentElement === null;
    }
}
