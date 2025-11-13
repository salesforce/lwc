describe('enumerable properties', () => {
    it('should not leak any properties on Object', () => {
        const properties = [];

        const obj = { x: 'x', y: 'y' };
        for (const property in obj) {
            properties.push(property);
        }

        expect(properties).toEqual(['x', 'y']);
    });

    it('should not leak any properties on Array', () => {
        const properties = [];

        const array = ['x', 'y'];
        for (const property in array) {
            properties.push(property);
        }
        expect(properties).toEqual(['0', '1']);
    });
});
