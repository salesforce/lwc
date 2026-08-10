import { LightningElement, api } from 'lwc';

// Donor exposes `pageReference` and `donorMethod` as public members, so its bridge element
// prototype has getter/setter/method descriptors for them. Those descriptors are the ones an
// attacker borrows and re-invokes against an unrelated component.
export default class Donor extends LightningElement {
    @api pageReference;

    @api donorMethod() {
        return 'donor-method-result';
    }
}
