describe('NodeList', () => {
    // W-23486660 identified a gap in the polyfill
    it('.item throws when used incorrectly', () => {
        const nodeList = document.querySelectorAll('*');
        expect(() => nodeList.item.call(document)).toThrow(TypeError);
    });
    it('.item works when used correctly', () => {
        const nodeList = document.querySelectorAll('*');
        expect(nodeList.item(0)).toBeDefined();
    });
});
