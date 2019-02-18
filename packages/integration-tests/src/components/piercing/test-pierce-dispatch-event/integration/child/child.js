import { LightningElement, register } from 'lwc';

register({
    piercing: (component, data, def, context, target, key, value, callback) => {
        if (value === EventTarget.prototype.dispatchEvent) {
            callback(function(event) {
                const realEvent = new CustomEvent(event.type, {
                    bubbles: true,
                    composed: true,
                });
                EventTarget.prototype.dispatchEvent.call(this, realEvent);
            });
        }
    },
});

export default class Child extends LightningElement {
    connectedCallback() {
        const event = {
            type: 'custom',
        };
        this.dispatchEvent(event);
    }
}
