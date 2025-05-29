import { LightningElement, api } from 'lwc';
import { defineMalformedContext } from 'x/contextManager';
export default class Root extends LightningElement {
    @api showTree = false;
    malformedContext = defineMalformedContext()();

    connectedCallback() {
        this.showTree = true;
    }
}
