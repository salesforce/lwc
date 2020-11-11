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
    get relatedTargetTagName() {
        return this._tagName;
    }

    rendered = false;
    renderedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.template.querySelector('textarea').focus();
            this.template.addEventListener('focusin', (event) => {
                this._tagName = event.relatedTarget.tagName;
            });
        }
    }
}
