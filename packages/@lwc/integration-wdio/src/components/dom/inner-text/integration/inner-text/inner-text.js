import { LightningElement } from 'lwc';

export default class InnerText extends LightningElement {
    _innerText = null;

    computeInputInnerText(evt) {
        this._innerText = evt.target.innerText;
    }

    computeDivInnerText() {
        this._innerText = this.template.querySelector('div').innerText;
    }
}
