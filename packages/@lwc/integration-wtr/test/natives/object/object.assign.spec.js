describe('Object assign', () => {
    it('should return copy of object on using object.assign', function () {
        const assign = { inner: 'foo' };
        const obj = Object.assign({}, assign);
        expect(obj.inner).toBe('foo');
    });
});
