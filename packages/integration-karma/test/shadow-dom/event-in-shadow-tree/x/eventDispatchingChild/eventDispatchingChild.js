import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api
    dispatchStandardEvent() {
        this.template.querySelector('.composed-event').dispatchEvent(
            new Event('event', {
                bubbles: true,
                composed: true,
            })
        );
    }
    @api
    dispatchCustomEvent() {
        this.template.querySelector('.composed-custom-event').dispatchEvent(
            new CustomEvent('customevent', {
                bubbles: true,
                composed: true,
            })
        );
    }
}
