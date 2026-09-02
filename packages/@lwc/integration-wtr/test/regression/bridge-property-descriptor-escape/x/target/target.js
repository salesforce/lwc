import { LightningElement, api } from 'lwc';

// Target has a `pageReference` accessor and a `secretMethod`, but neither is `@api`, so they are
// NOT public. A borrowed donor descriptor must not be able to reach them from outside the component.
export default class Target extends LightningElement {
    // Records whether the private accessor/method was actually reached, so the test can assert the
    // guard blocked the borrowed descriptor before it hit the component instance.
    @api privateSetterInvokedWith = undefined;
    @api privateGetterInvoked = false;
    @api privateMethodInvoked = false;

    _pageReference = 'private-target-value';

    get pageReference() {
        this.privateGetterInvoked = true;
        return this._pageReference;
    }

    set pageReference(value) {
        this.privateSetterInvokedWith = value;
        this._pageReference = value;
    }

    donorMethod() {
        this.privateMethodInvoked = true;
        return 'target-private-method';
    }
}
