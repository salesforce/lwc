import { Element, api } from 'engine';

export default class ComposedEvents extends Element {
    handleClick() {
        this.dispatchEvent(new CustomEvent('foo'));
    }
}
