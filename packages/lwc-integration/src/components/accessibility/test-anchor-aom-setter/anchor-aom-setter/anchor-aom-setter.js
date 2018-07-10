import { Element, track } from 'engine';

export default class AnchorAOMSetter extends Element {
    @track errorText = 'no error';
    handleClick() {
        try {
            this.template.querySelector('a').ariaLabel = 'label';
        } catch (e) {
            this.errorText = e.message;
        }
    }
}
