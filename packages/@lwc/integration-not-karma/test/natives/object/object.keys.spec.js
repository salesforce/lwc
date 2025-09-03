describe('Object keys', () => {
    it('should have the right value', function () {
        const keys = Object.keys({
            bar: 'foo',
            foo: 'bar',
        });
        expect(keys).toEqual(['bar', 'foo']);
    });
});
