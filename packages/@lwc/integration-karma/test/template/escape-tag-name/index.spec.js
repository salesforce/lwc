import { createElement } from 'lwc';
import { catchUnhandledRejectionsAndErrors } from 'test-utils';
import Component from 'x/component';

// Browsers treat tag names containing the \ (backslash) character differently
// depending on whether the HTML is parsed or you call `setAttribute` directly.
//
// Succeeds:
//
//     elm.innerHTML = '<s\ection></s\ection>'
//
// Fails with: Uncaught InvalidCharacterError: Failed to execute 'createElement' on 'Document': The tag name provided ('s\ection') is not a valid name.
//
//     document.createElement('s\\ection')
//
// Since the static content optimization only uses the first pattern and non-optimized only uses the second,
// one case will work whereas the other will throw an error.
//
// Since using backslashes in attribute names is fairly useless, we do not attempt to smooth out this difference.

let caughtError;

catchUnhandledRejectionsAndErrors((error) => {
    caughtError = error;
});

afterEach(() => {
    caughtError = undefined;
});

it('should render tag names with proper escaping', async () => {
    const elm = createElement('x-component', { is: Component });
    document.body.appendChild(elm);

    await Promise.resolve();

    if (process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION) {
        expect(elm.shadowRoot.children.length).toBe(0); // does not render
        expect(caughtError).not.toBeUndefined();
        expect(caughtError.message).toMatch(
            /Failed to execute 'createElement'|Invalid qualified name|String contains an invalid character/
        );
    } else {
        expect(elm.shadowRoot.children[0].tagName).toBe('S\\ECTION');
        expect(caughtError).toBeUndefined();
    }
});
