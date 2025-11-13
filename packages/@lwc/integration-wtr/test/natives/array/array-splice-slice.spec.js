describe('Testing array primitives', () => {
    it('Array.slice without arguments returns shallow copy of all entries', function () {
        const original = ['one', 'two', 'three', 'four', 'five'];
        expect(original.slice()).toEqual(['one', 'two', 'three', 'four', 'five']);
    });

    it('Array.splice will remove specified item', function () {
        const original = ['one', 'two', 'three', 'four', 'five'];
        const splicedList = ['one', 'three', 'four', 'five'];
        original.splice(1, 1);
        expect(original).toEqual(splicedList);
    });
});
