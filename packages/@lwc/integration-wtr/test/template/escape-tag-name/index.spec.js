import { createElement } from 'lwc';
import Component from 'x/component';
import { catchUnhandledRejectionsAndErrors } from '../../../helpers/utils.js';

// Browsers treat tag names containing the \ (backslash) character differently
// depending on whether the HTML is parsed or you call `createElement` directly.
//
// Succeeds:
//
//     elm.innerHTML = '<s\ection></s\ection>'
//
// Fails in some browsers with: Uncaught InvalidCharacterError: Failed to execute 'createElement' on 'Document': The tag name provided ('s\ection') is not a valid name.
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
    let directError;
    try {
        document.body.appendChild(elm);
    } catch (err) {
        // Synthetic lifecycle throws render errors synchronously from `appendChild`
        directError = err;
    }

    await Promise.resolve();
    const caught = directError || caughtError;

    // Only fails in some browsers. If no errors were caught, assert against the attribute as normal.
    if (process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION && caught) {
        expect(elm.shadowRoot.children.length).toBe(0); // does not render
        expect(caught).not.toBeUndefined();
        expect(caught.message).toMatch(
            /Failed to execute 'createElement'|Invalid qualified name|String contains an invalid character|The string contains invalid characters/
        );
    } else {
        expect(elm.shadowRoot.children[0].tagName).toBe('S\\ECTION');
        expect(caught).toBeUndefined();
    }
});
