import { allowedLwcImports } from '../runtime';

describe('allowedLwcImports does not include', () => {
    it.for(['fallbackTmpl', 'renderAttrs', 'SYMBOL__SET_INTERNALS', 'validateStyleTextContents'])(
        '%s',
        (specifier) => {
            expect(allowedLwcImports.has(specifier)).toBeFalsy();
        }
    );
});
