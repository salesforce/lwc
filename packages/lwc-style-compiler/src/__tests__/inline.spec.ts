import { transform } from '../index';

describe('playground test for debugging ', () => {
    it('examples', () => {
        const src =`
h1 {
    border: 1px var(--border-type, solid) var(--mycolor, rgba(0,0,0,0.1));
}

h2 {
    background: var(--lwc-color, var(--lwc-other, black));
}
`;
        const { code } = transform(src, 'test', {});
        expect(code).toBeDefined();
    });
});
