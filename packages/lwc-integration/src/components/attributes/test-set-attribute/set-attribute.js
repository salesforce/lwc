import { Element } from 'engine';

export default class SetAttribute extends Element {
    connectedCallback() {
        this.setAttribute('customattribute', 'bar');
    }
}