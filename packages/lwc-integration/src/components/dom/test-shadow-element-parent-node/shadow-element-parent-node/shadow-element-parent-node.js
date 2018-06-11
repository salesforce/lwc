import { Element, track, unwrap } from 'engine';

export default class ShadowElementParentNode extends Element {
    @track parentIsRoot = false;

    renderedCallback() {
        if (this.parentIsRoot === true) {
            return;
        }
        this.parentIsRoot = unwrap(this.template.querySelector('div').parentNode) === this.template;
    }
}
