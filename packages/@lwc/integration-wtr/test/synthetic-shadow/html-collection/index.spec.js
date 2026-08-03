describe('HTMLCollection', () => {
    // W-23486660 identified a gap in the polyfill
    it('.item throws when used incorrectly', () => {
        const collection = document.getElementsByTagName('body');
        expect(() => collection.item.call(document)).toThrow(TypeError);
    });
    it('.item works when used correctly', () => {
        const collection = document.getElementsByTagName('body');
        expect(collection.item(0)).toBeDefined();
    });
});
