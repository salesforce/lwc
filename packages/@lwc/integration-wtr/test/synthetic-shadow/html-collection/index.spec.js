import { setFeatureFlagForTest } from 'lwc';

describe.skipIf(process.env.NATIVE_SHADOW)('HTMLCollection polyfill', () => {
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LEGACY_ITEM_POLYFILL', false);
    });

    // W-23486660 identified a gap in the polyfill
    it('.item throws when used incorrectly', () => {
        const collection = document.getElementsByTagName('body');
        expect(() => collection.item.call(document)).toThrow(TypeError);
    });
    it('.item throws when called on a forged instance', () => {
        const collection = document.getElementsByTagName('body');
        const fake = Object.create(collection.constructor.prototype);
        expect(() => collection.item.call(fake, 0)).toThrow(TypeError);
    });
    it('.item works when used correctly', () => {
        const collection = document.getElementsByTagName('body');
        expect(collection.item(0)).toBeDefined();
    });
    it('.item skips the receiver check when ENABLE_LEGACY_ITEM_POLYFILL is true', () => {
        setFeatureFlagForTest('ENABLE_LEGACY_ITEM_POLYFILL', true);
        const collection = document.getElementsByTagName('body');
        expect(() => collection.item.call(document, 0)).not.toThrow();
    });
    it('.namedItem returns the element matching the given id', () => {
        const div = document.createElement('div');
        div.id = 'w-23486660-named-item';
        document.body.appendChild(div);
        try {
            const collection = document.getElementsByTagName('div');
            expect(collection.namedItem('w-23486660-named-item')).toBe(div);
        } finally {
            document.body.removeChild(div);
        }
    });
});
