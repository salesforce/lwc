import { Element, track } from 'engine';

export default class ShadowElementParentNode extends Element {
    @track parentIsRoot = false;

    renderedCallback() {
        if (this.parentIsRoot === true) {
            return;
        }
        this.parentIsRoot = this.template.querySelector('div').parentNode === this.template;
    }
}
