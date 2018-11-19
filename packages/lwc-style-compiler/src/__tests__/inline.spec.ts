import { transform } from '../index';

describe('playground test for debugging ', () => {
    it('examples', () => {
        const src = `
            @import "@foo/test";
        `;
        const { code } = transform(src, 'test', {
            customProperties: {
                resolverModule: "custom-properties-resolver"
            }
        });

        expect(code).toBeDefined();
    });
});
