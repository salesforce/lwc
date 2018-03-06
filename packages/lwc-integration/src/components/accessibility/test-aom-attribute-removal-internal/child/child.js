import { Element } from 'engine';

export default class Child extends Element {
    connectedCallback() {
        this.root.ariaLabel = 'tab';
        this.setAttribute('aria-label', 'button');
    }

    handleClick() {
        this.removeAttribute('aria-label');
    }
}
