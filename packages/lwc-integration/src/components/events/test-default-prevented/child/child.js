import { Element, track } from 'engine';

export default class Child extends Element {
    @track defaultPrevented = false;

    handleClick() {
        const event = new CustomEvent('foo', {
            cancelable: true,
        });
        this.dispatchEvent(event);
        this.defaultPrevented = event.defaultPrevented;
    }
}
