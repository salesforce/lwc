import { setFeatureFlagForTest } from 'lwc';
import { resetDOM } from '../../../helpers/reset';

describe.skipIf(process.env.NATIVE_SHADOW)('HTMLCollection polyfill', () => {
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LEGACY_ITEM_POLYFILL', false);
        setFeatureFlagForTest('ENABLE_BROKEN_HTML_COLLECTION_NAMED_ITEM', false);
        resetDOM();
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
        div.id = 'named-item';
        document.body.appendChild(div);
        const collection = document.getElementsByTagName('div');
        expect(collection.namedItem('named-item')).toBe(div);
    });
    it('.namedItem returns null when no element matches', () => {
        const collection = document.getElementsByTagName('div');
        expect(collection.namedItem('w-broken-named-item-missing')).toBeNull();
    });
    it('.namedItem reproduces the broken lookup when ENABLE_BROKEN_HTML_COLLECTION_NAMED_ITEM is true', () => {
        setFeatureFlagForTest('ENABLE_BROKEN_HTML_COLLECTION_NAMED_ITEM', true);
        const div = document.createElement('div');
        div.id = 'broken-named-item';
        document.body.appendChild(div);
        const collection = document.getElementsByTagName('div');
        expect(() => collection.namedItem('broken-named-item-flagged')).toThrow(TypeError);
    });
});
