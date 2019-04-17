import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    _defaultPrevented = false;
    @api
    get defaultPrevented() {
        return this._defaultPrevented;
    }

    @api
    dispatchCancelableEvent() {
        const event = new CustomEvent('foo', {
            cancelable: true,
        });
        this.dispatchEvent(event);
        this._defaultPrevented = event.defaultPrevented;
    }
}
