import { createElement, setFeatureFlagForTest } from 'lwc';
import HelloWorld from 'x/component';
import { catchUnhandledRejectionsAndErrors } from '../../../helpers/utils.js';

describe('stylesheet validation', () => {
    let caughtError;

    catchUnhandledRejectionsAndErrors((error) => {
        caughtError = error;
    });

    beforeEach(() => {
        setFeatureFlagForTest('DISABLE_SCOPE_TOKEN_VALIDATION', false);
    });

    afterEach(() => {
        caughtError = undefined;
    });

    it('should not permit invalid stylesheets', async () => {
        const elm = createElement('x-component', { is: HelloWorld });

        try {
            document.body.appendChild(elm);
        } catch (err) {
            // In synthetic custom element lifecycle, the error is thrown synchronously on `appendChild`
            caughtError = err;
        }

        await Promise.resolve();

        expect(caughtError).not.toBeUndefined();
        expect(caughtError.message).toMatch(
            /stylesheet token must be a valid string|Failed to execute 'setAttribute'|Invalid qualified name|String contains an invalid character|The string contains invalid characters/
        );
        expect(elm.stylesheet).not.toHaveBeenCalled();
    });
});
