describe('Plain array methods', () => {
    it('should get expected items correctly after push', function () {
        const array = [1, 2];
        array.push(3, 4);
        expect(array).toEqual([1, 2, 3, 4]);
    });
    it('should display concat items correctly', function () {
        let array = [1, 2];
        array = array.concat([3, 4]);
        expect(array).toEqual([1, 2, 3, 4]);
    });
});
