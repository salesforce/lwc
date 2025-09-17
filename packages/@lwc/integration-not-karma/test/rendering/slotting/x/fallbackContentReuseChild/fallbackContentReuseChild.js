import { LightningElement } from 'lwc';

export default class FallbackContentReuseChild extends LightningElement {
    renderedCallback() {
        const defaultFallback = this.template.querySelector('slot div');
        if (defaultFallback) {
            defaultFallback.setAttribute('fallback', '');
        }

        const namedFallback = this.template.querySelector('slot[name=foo] div');
        if (namedFallback) {
            namedFallback.setAttribute('fallback', '');
        }
    }
}
