import { createElement } from 'lwc';
import HelloWorld from 'x/component';

describe('stylesheet validation', () => {
    it('should not permit invalid stylesheets', () => {
        const elm = createElement('x-component', { is: HelloWorld });

        let caughtError;
        try {
            document.body.appendChild(elm);
        } catch (err) {
            // Synthetic lifecycle throws the error synchronously on `appendChild`
            caughtError = err;
        }

        expect(caughtError).not.toBeUndefined();
        expect(caughtError.message).toMatch(
            /stylesheet token must be a valid string|Failed to execute 'setAttribute'|Invalid qualified name|String contains an invalid character|The string contains invalid characters/
        );
        expect(elm.stylesheet).not.toHaveBeenCalled();
    });
});
