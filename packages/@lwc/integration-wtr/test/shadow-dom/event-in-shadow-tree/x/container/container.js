import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    dispatchEventComponent(event) {
        this.dispatchEvent(event);
    }

    @api
    get testEventReceived() {
        return this._testEventReceived || false;
    }

    handleTest() {
        this._testEventReceived = true;
    }

    renderedCallback() {
        const spanManual = document.createElement('span');
        spanManual.setAttribute('data-id', 'container_span_manual');
        const span = this.template.querySelector('[data-id="container_span"]');
        span.appendChild(spanManual);
    }
}
