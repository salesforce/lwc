import { Element } from 'engine';

export default class Child extends Element {
    handleClick() {
        const event = new CustomEvent('foo', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
                name: 'grand-child',
            },
        });

        this.dispatchEvent(event);
    }
}
