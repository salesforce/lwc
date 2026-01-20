import { api, LightningElement } from 'lwc';

export default class Test extends LightningElement {
    // See W-17585549
    @api contains() {
        throw new Error(`
Karma, karma, karma, karma, karma chameleon
You come and go, you come and go
Loving would be easy if your colours were like my dream
Red, gold and green, red, gold and green
        `);
    }
    @api compareHostElement() {
        return this.hostElement.shadowRoot.compareDocumentPosition.call(
            this.hostElement,
            this.hostElement.shadowRoot
        );
    }
}
