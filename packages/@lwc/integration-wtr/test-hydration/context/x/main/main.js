import { LightningElement, api } from 'lwc';
import { defineMalformedContext } from 'x/contextManager';
export default class Root extends LightningElement {
    @api showTree = false;
    // Only test in CSR right now as SSR throws which prevents content from being rendered. There is additional fixtures ssr coverage for this case.
    malformedContext = typeof window !== 'undefined' ? defineMalformedContext()() : undefined;

    connectedCallback() {
        this.showTree = true;
    }
}
