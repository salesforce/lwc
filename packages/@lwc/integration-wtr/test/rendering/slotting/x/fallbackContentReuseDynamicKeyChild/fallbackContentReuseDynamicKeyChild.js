import { LightningElement } from 'lwc';

export default class FallbackContentReuseDynamicKeyChild extends LightningElement {
    // These happen to be the keys generated for the <div>s in the default and "foo"
    // slots, respectively, in fallbackContentReuseChild.html
    defaultItems = [1];
    fooItems = [3];

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
