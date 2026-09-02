import { LightningElement } from 'lwc';
import { createTrustedContext } from 'x/trustedContext';

export default class MultiContextConsumer extends LightningElement {
    // Two trusted-context fields → two provider listeners; both must be removed on disconnect.
    contextA = createTrustedContext();
    contextB = createTrustedContext();
}
