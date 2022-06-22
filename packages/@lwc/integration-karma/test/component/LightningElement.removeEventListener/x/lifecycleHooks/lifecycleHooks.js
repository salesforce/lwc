import { LightningElement } from 'lwc';

export default class LifecycleHooks extends LightningElement {
    constructor() {
        super();
        this.tryRemoveEventListener();
    }
    connectedCallback() {
        this.tryRemoveEventListener();
    }
    disconnectedCallback() {
        this.tryRemoveEventListener();
    }
    renderedCallback() {
        this.tryRemoveEventListener();
    }

    tryRemoveEventListener() {
        const handler = () => {};

        this.addEventListener('click', handler);
        this.removeEventListener('click', handler);
    }
}
