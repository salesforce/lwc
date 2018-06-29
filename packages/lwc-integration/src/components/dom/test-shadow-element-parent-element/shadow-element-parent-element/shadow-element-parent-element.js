import { Element, track, unwrap } from 'engine';

export default class ShadowElementParentElement extends Element {
    @track parentIsRoot = false;

    renderedCallback() {
        if (this.parentIsRoot === true) {
            return;
        }
        this.parentIsRoot = this.template.querySelector('div').parentElement === null;
    }
}
