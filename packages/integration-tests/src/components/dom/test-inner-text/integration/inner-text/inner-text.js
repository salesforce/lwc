import { LightningElement, api } from 'lwc';

export default class InnerText extends LightningElement {
    _innerText = null;

    @api
    getTypedText() {
        return this.template.querySelector('input').value;
    }

    @api
    getInnerText() {
        return this._innerText;
    }

    computeInputInnerText(evt) {
        this._innerText = evt.target.innerText;
    }

    computeDivInnerText(evt) {
        this._innerText = evt.target.innerText;
    }
}
