describe('Array prototype methods', () => {
    let items;
    beforeEach(() => {
        items = ['first', 'second'];
    });
    it('should display unshifted items correctly', function () {
        items.unshift('unshifted');
        expect(items).toEqual(['unshifted', 'first', 'second']);
    });

    it('should display pushed items correctly', function () {
        items.push('pushed');
        expect(items).toEqual(['first', 'second', 'pushed']);
    });

    it('should display concat items correctly', function () {
        items = items.concat(['concat 1', 'concat 2']);
        expect(items).toEqual(['first', 'second', 'concat 1', 'concat 2']);
    });

    it('should display concat items correctly', function () {
        items = ['concat 1', 'concat 2'].concat(items);
        expect(items).toEqual(['concat 1', 'concat 2', 'first', 'second']);
    });
});
