import { Element, track } from 'engine';

export default class ShadowRootAom extends Element {
    @track childAriaLabel = 'button';

    handleClick() {
        this.childAriaLabel = null;
    }
}
