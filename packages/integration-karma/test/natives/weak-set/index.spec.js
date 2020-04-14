describe('WeakSet insertion', () => {
    it('should have the right value', function () {
        const set = new WeakSet();
        const proxy = new Proxy({}, {});
        expect(set.has(proxy)).toBe(false);
        set.add(proxy);
        expect(set.has(proxy)).toBe(true);
    });
});
