import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api usePropertyAccess = false;

    @api
    setAriaLabelledBy(id) {
        if (this.usePropertyAccess) {
            this.refs.input.ariaLabelledBy = id; // non-standard, LWC-specific legacy format
        } else {
            this.refs.input.setAttribute('aria-labelledby', id);
        }
    }

    @api
    getAriaLabelledBy() {
        if (this.usePropertyAccess) {
            return this.refs.input.ariaLabelledBy; // non-standard, LWC-specific legacy format
        } else {
            return this.refs.input.getAttribute('aria-labelledby');
        }
    }
}
