import { setFeatureFlagForTest } from 'lwc';

describe('NodeList', () => {
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LEGACY_ITEM_POLYFILL', false);
    });

    // W-23486660 identified a gap in the polyfill
    it('.item throws when used incorrectly', () => {
        const nodeList = document.querySelectorAll('*');
        expect(() => nodeList.item.call(document)).toThrow(TypeError);
    });
    it('.item throws when called on a forged instance', () => {
        const nodeList = document.querySelectorAll('*');
        const fake = Object.create(nodeList.constructor.prototype);
        expect(() => nodeList.item.call(fake, 0)).toThrow(TypeError);
    });
    it('.item works when used correctly', () => {
        const nodeList = document.querySelectorAll('*');
        expect(nodeList.item(0)).toBeDefined();
    });
    it('.item skips the receiver check when ENABLE_LEGACY_ITEM_POLYFILL is true', () => {
        // Native shadow: @lwc/synthetic-shadow is not loaded, so the polyfill and its flag do not
        // apply; the native `item` still rejects a bad receiver.
        if (process.env.NATIVE_SHADOW) {
            return;
        }
        setFeatureFlagForTest('ENABLE_LEGACY_ITEM_POLYFILL', true);
        const nodeList = document.querySelectorAll('*');
        expect(() => nodeList.item.call(document, 0)).not.toThrow();
    });
});
