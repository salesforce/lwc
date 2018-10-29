import { transform } from '../index';

describe('playground test for debugging ', () => {
    it('examples', () => {
        const src = `
        :host(.foo) {
            color: var(--b);
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
