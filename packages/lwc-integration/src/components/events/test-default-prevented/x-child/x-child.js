import { Element, track } from 'engine';

export default class Child extends Element {
    handleClick() {
        const event = new CustomEvent('foo', {
            cancelable: true,
            detail: {
                name: 'child',
            },
        });
        this.dispatchEvent(event);
    }

    handleFoo(evt) {
        evt.preventDefault();
    }
}
