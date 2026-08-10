import { createElement, setFeatureFlagForTest } from 'lwc';
import Donor from 'x/donor';
import Target from 'x/target';

// W-23641816: LWC bridge property descriptors are cached by member name and shared across every
// component's bridge element. Their getter/setter/method recover the component VM from the
// invocation receiver (`this`) but historically never verified that the captured member was public
// on that receiver's component definition. That let an attacker borrow a public descriptor from one
// component (the "donor") and re-invoke it against an unrelated component (the "target") to reach a
// like-named *private* member — e.g. a private `pageReference` accessor — from outside the sandbox.

// Grabs the donor's public bridge descriptor the way the exploit does: walk the element's prototype
// chain (the descriptors live on the bridge element prototype, not the instance) and return the
// first descriptor found for `name`.
function getDonorBridgeDescriptor(element, name) {
    let proto = Object.getPrototypeOf(element);
    while (proto !== null) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, name);
        if (descriptor) {
            return descriptor;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return undefined;
}

describe('bridge property descriptor escape (W-23641816)', () => {
    let donor;
    let target;

    beforeEach(() => {
        donor = createElement('x-donor', { is: Donor });
        target = createElement('x-target', { is: Target });
        document.body.appendChild(donor);
        document.body.appendChild(target);
    });

    afterEach(() => {
        document.body.removeChild(donor);
        document.body.removeChild(target);
        setFeatureFlagForTest('DISABLE_BRIDGE_ELEMENT_PROPERTY_GUARD', false);
    });

    it('exposes public accessor/method descriptors on the donor (sanity check)', () => {
        // The donor legitimately makes pageReference and donorMethod public, so its bridge exposes
        // real getter/setter/method descriptors for them. These are what an attacker borrows.
        const propDescriptor = getDonorBridgeDescriptor(donor, 'pageReference');
        expect(typeof propDescriptor.get).toBe('function');
        expect(typeof propDescriptor.set).toBe('function');
        expect(typeof getDonorBridgeDescriptor(donor, 'donorMethod').value).toBe('function');
    });

    it('blocks a borrowed setter from reaching a private member on another component', () => {
        const descriptor = getDonorBridgeDescriptor(donor, 'pageReference');

        expect(() =>
            descriptor.set.call(target, { attributes: 'attacker-controlled' })
        ).toThrowError(/not a public property or method/);
        // The private setter on the target must never have run.
        expect(target.privateSetterInvokedWith).toBeUndefined();
    });

    it('blocks a borrowed getter from reading a private member on another component', () => {
        const descriptor = getDonorBridgeDescriptor(donor, 'pageReference');

        expect(() => descriptor.get.call(target)).toThrowError(/not a public property or method/);
        expect(target.privateGetterInvoked).toBe(false);
    });

    it('blocks a borrowed method from invoking a private method on another component', () => {
        const descriptor = getDonorBridgeDescriptor(donor, 'donorMethod');

        expect(() => descriptor.value.call(target)).toThrowError(/not a public property or method/);
        expect(target.privateMethodInvoked).toBe(false);
    });

    it('still allows a descriptor to be used against its own public member', () => {
        const descriptor = getDonorBridgeDescriptor(donor, 'pageReference');

        // Using the descriptor on the donor itself (where pageReference IS public) must keep working.
        expect(() => descriptor.set.call(donor, 'legit-value')).not.toThrow();
        expect(descriptor.get.call(donor)).toBe('legit-value');
    });

    it('does not break normal public property/method access', () => {
        // Regular external access to the donor's public members goes through the same bridge
        // descriptors and must be unaffected by the guard.
        donor.pageReference = 'external-value';
        expect(donor.pageReference).toBe('external-value');
        expect(donor.donorMethod()).toBe('donor-method-result');
    });

    it('does not throw when the guard is disabled via feature flag (legacy behavior)', () => {
        setFeatureFlagForTest('DISABLE_BRIDGE_ELEMENT_PROPERTY_GUARD', true);
        const descriptor = getDonorBridgeDescriptor(donor, 'pageReference');

        // With the guard off, the borrowed setter reaches the target's private accessor (the
        // vulnerable pre-fix behavior). We assert the escape happens so the flag is a real kill switch.
        expect(() => descriptor.set.call(target, 'attacker-controlled')).not.toThrow();
        expect(target.privateSetterInvokedWith).toBe('attacker-controlled');
    });
});
