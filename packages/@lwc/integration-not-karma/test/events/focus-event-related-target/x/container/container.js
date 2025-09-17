import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    focusFirstInput() {
        this.template.querySelector(`.first`).focus();
    }

    @api
    focusSecondInput() {
        this.template.querySelector(`.second`).focus();
    }

    @api
    get relatedTargetClassName() {
        return this._className;
    }

    handleFocusIn(event) {
        this._className = event.relatedTarget && event.relatedTarget.className;
    }
}
