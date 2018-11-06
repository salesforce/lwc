import { transform } from '../index';

describe('playground test for debugging ', () => {
    it('examples', () => {
        const src = `
        :host:not(.selected):hover button,
        :host button:focus {
            color: #005fb2; /* $color-background-button-brand-hover */
            transform: scale(1.2);
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
