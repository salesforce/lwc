import { LightningElement, api } from 'lwc';

export default class ShadowTree extends LightningElement {
    @api dispatchEventComponent(evt) {
        this.dispatchEvent(evt);
    }

    renderedCallback() {
        const spanManual = document.createElement('span');
        spanManual.setAttribute('data-id', 'span-manual');

        const divManual = this.template.querySelector('[data-id="div-manual"]');
        divManual.appendChild(spanManual);
    }
}
