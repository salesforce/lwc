import { LightningElement } from 'lwc';

export default class extends LightningElement {
    fooLabel = 'INITIAL_LABEL_VALUE';

    connectedCallback() {
        import('./labels.js').then((mod) => {
            this.fooLabel = mod.LABELS.foo;
        });
    }

    async foo() {
        const mod = await import('./labels.js');
        // We can't guard against subsequent operations:
        // this.fooLabel = mod.LABELS.foo;
    }
}