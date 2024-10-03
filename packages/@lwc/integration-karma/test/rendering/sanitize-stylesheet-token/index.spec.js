import { createElement, setFeatureFlagForTest } from 'lwc';
import { catchUnhandledRejectionsAndErrors } from 'test-utils';
import Component from 'x/component';
import Scoping from 'x/scoping';

let caughtError;
let logger;

catchUnhandledRejectionsAndErrors((error) => {
    caughtError = error;
});

beforeEach(() => {
    logger = spyOn(console, 'warn');
});

afterEach(() => {
    caughtError = undefined;
});

const props = ['stylesheetToken', 'stylesheetTokens', 'legacyStylesheetToken'];

const components = [
    {
        tagName: 'x-component',
        Ctor: Component,
        name: 'unscoped styles',
    },
    {
        tagName: 'x-scoping',
        Ctor: Scoping,
        name: 'scoped styles',
    },
];

props.forEach((prop) => {
    describe(prop, () => {
        components.forEach(({ tagName, Ctor, name }) => {
            describe(name, () => {
                beforeEach(() => {
                    setFeatureFlagForTest(
                        'ENABLE_LEGACY_SCOPE_TOKENS',
                        prop === 'legacyStylesheetToken'
                    );
                });

                afterEach(() => {
                    setFeatureFlagForTest('ENABLE_LEGACY_SCOPE_TOKENS', false);
                    // We keep a cache of parsed static fragments; these need to be reset
                    // since they can vary based on whether we use the legacy scope token or not.
                    window.__lwcResetFragmentCache();
                    // Reset template object for clean state between tests
                    Ctor.resetTemplate();
                });

                it('W-16614556 should not render arbitrary content via stylesheet token', async () => {
                    const elm = createElement(tagName, { is: Ctor });
                    elm.propToUse = prop;
                    try {
                        document.body.appendChild(elm);
                    } catch (err) {
                        // In synthetic custom element lifecycle, the error is thrown synchronously on `appendChild`
                        caughtError = err;
                    }

                    await Promise.resolve();

                    if (
                        process.env.NATIVE_SHADOW &&
                        process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION
                    ) {
                        // If we're rendering in native shadow and the static content optimization is disabled,
                        // then there's no problem with non-string stylesheet tokens because they are only rendered
                        // as class attribute values using either `classList` or `setAttribute` (and this only applies
                        // when `*.scoped.css` is being used).
                        expect(elm.shadowRoot.children.length).toBe(1);
                    } else {
                        expect(elm.shadowRoot.children.length).toBe(0); // does not render

                        expect(caughtError).not.toBeUndefined();
                        expect(caughtError.message).toMatch(
                            /stylesheet token must be a valid string|Failed to execute 'setAttribute'|Invalid qualified name|String contains an invalid character|The string contains invalid characters/
                        );

                        if (process.env.NODE_ENV === 'production') {
                            // no warnings in prod mode
                            expect(logger).not.toHaveBeenCalled();
                        } else {
                            // dev mode
                            expect(logger).toHaveBeenCalledTimes(1);
                            expect(`${logger.calls.allArgs()[0]}`).toMatch(
                                new RegExp(
                                    `Mutating the "${prop}" property on a template is deprecated`
                                )
                            );
                        }
                    }
                });
            });
        });
    });
});
