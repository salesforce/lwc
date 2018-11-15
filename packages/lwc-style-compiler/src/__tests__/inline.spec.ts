import { transform } from '../index';

describe('playground test for debugging ', () => {
    it('examples', () => {
        const src = `
        @media screen and (max-width: 768px) {
            :host {
                width: calc(50% - 1rem);
            }
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
