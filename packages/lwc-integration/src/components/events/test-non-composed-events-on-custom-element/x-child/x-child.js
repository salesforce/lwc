import { Element, api } from 'engine';

export default class Child extends Element {
    handleClick() {
        this.dispatchEvent(new CustomEvent('customevent'));
        this.dispatchEvent(new Event('event'));
    }
}
