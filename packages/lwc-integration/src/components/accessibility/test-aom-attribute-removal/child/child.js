import { Element } from 'engine';

export default class Child extends Element {
    connectedCallback() {
        this.root.ariaLabel = 'tab';
    }
}
