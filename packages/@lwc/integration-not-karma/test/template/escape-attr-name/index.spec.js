import { createElement } from 'lwc';
import { catchUnhandledRejectionsAndErrors } from 'test-utils';
import BooleanValue from 'x/booleanValue';
import StringValue from 'x/stringValue';

// Browsers treat attribute names containing the ` (backtick) character differently
// depending on whether the HTML is parsed or you call `setAttribute` directly.
//
// Succeeds:
//
//     elm.innerHTML = '<div a`b`c></div>'
//
// Fails with: Uncaught InvalidCharacterError: Failed to execute 'setAttribute' on 'Element': 'a`b`c' is not a valid attribute name.
//
//     elm.setAttribute(theName, 'a`b`c')
//
// Since the static content optimization only uses the first pattern and non-optimized only uses the second,
// one case will work whereas the other will throw an error.
//
// Since using backticks in attribute names is fairly useless, we do not attempt to smooth out this difference.

let caughtError;

catchUnhandledRejectionsAndErrors((error) => {
    caughtError = error;
});

afterEach(() => {
    caughtError = undefined;
});

const scenarios = [
    {
        name: 'boolean-true-value',
        expectedValue: '',
        Ctor: BooleanValue,
        tagName: 'x-boolean-value',
    },
    {
        name: 'string-value',
        expectedValue: 'yolo',
        Ctor: StringValue,
        tagName: 'x-string-value',
    },
];

scenarios.forEach(({ name, expectedValue, Ctor, tagName }) => {
    describe(name, () => {
        it('should render attr names with proper escaping', async () => {
            const elm = createElement(tagName, { is: Ctor });
            document.body.appendChild(elm);

            await Promise.resolve();
            if (process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION) {
                expect(elm.shadowRoot.children.length).toBe(0); // does not render
                expect(caughtError).not.toBeUndefined();
                expect(caughtError.message).toMatch(
                    /Failed to execute 'setAttribute' on 'Element'|Invalid qualified name|String contains an invalid character|The string contains invalid characters/
                );
            } else {
                expect(elm.shadowRoot.children[0].getAttribute('a`b`c')).toBe(expectedValue);
                expect(caughtError).toBeUndefined();
            }
        });
    });
});
