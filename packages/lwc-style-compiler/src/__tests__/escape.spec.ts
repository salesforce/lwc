import { transform } from '../index';

describe('scaping', () => {
    it('examples', () => {
        const src = require('fs').readFileSync(__dirname + '/fixtures/escape-characters/actual.css', 'utf8');
        const { code } = transform(src, 'test', {
            customProperties: {
                resolverModule: "custom-properties-resolver"
            }
        });
        expect(code).toBeDefined();
    });
});
