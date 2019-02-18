import { LightningElement, track } from 'lwc';

export default class ShadowElementParentNode extends LightningElement {
    @track parentIsRoot = false;

    renderedCallback() {
        if (this.parentIsRoot === true) {
            return;
        }
        this.parentIsRoot = this.template.querySelector('div').parentNode === this.template;
    }
}
