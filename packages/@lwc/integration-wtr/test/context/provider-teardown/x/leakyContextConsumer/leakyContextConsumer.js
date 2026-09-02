import { LightningElement } from 'lwc';
import { createTrustedContext } from 'x/trustedContext';

export default class LeakyContextConsumer extends LightningElement {
    // Trusted-context field: makes the engine register a provider listener on this element on connect.
    context = createTrustedContext();
}
