import { createElement, setFeatureFlagForTest } from 'lwc';
import HelloWorld from 'x/component';
import { spyOn } from '@vitest/spy';
import { catchUnhandledRejectionsAndErrors } from '../../../helpers/utils.js';

describe('stylesheet eval test', () => {
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

    it('should not call alert when stylesheetToken is malicious', async () => {
        const alertSpy = spyOn(window, 'alert').mockImplementation(() => {});
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
        expect(alertSpy).not.toHaveBeenCalled();

        alertSpy.mockRestore();
    });
});
