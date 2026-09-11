import { LightningElement, track } from 'lwc';

export default class Life extends LightningElement {
    @track phase = 'constructed';

    connectedCallback() {
        this.phase = 'connected';
    }

    disconnectedCallback() {
        // Record on a global so the test can observe disconnection.
        window.__vaporLifecycle = window.__vaporLifecycle || {};
        window.__vaporLifecycle.disconnected = true;
    }
}
