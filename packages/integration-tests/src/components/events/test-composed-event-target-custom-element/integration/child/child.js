import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api
    dispatchFoo() {
        this.dispatchEvent(
            new CustomEvent('foo', {
                composed: true,
                bubbles: true,
            })
        );
    }
}
