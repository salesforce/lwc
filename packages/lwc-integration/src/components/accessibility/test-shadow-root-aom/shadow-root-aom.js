import { Element, track } from 'engine';

export default class ShadowRootAom extends Element {
    connectedCallback() {
        this.root.ariaLabel = 'internallabel';
    }
}
