import { transform } from '../index';

describe('playground test for debugging ', () => {
    it('examples', () => {
        const src =`
@import "foo";

:host {
    color: var(--green) inherit;
    content: "x";
}

h1 {

    border: 1px var(--border-type, solid) var(--mycolor, rgba(0,0,0,0.1));
    content: "foo";
}

h2 {
    background: var(--lwc-color, var(--lwc-other, black));
    padding:10px
}
`;
        const { code } = transform(src, 'test', {
            customProperties: {
                resolverModule: "custom-properties-resolver"
            }
        });
        console.log(code);

        expect(code).toBeDefined();
    });
});
