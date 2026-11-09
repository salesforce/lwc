import { createElement } from 'lwc';
import Component from 'x/component';
import Scoping from 'x/scoping';
import Indirect from 'x/indirect';
import { spyOn } from '@vitest/spy';
import { resetAlreadyLoggedMessages, resetFragmentCache } from '../../../helpers/reset.js';

let logger;

beforeAll(() => {
    logger = spyOn(console, 'warn');
});

afterEach(() => {
    logger.mockReset();
});

afterAll(() => {
    logger.mockRestore();
});

const props = ['stylesheetToken', 'stylesheetTokens'];

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
    {
        tagName: 'x-indirect',
        Ctor: Indirect,
        name: 'indirect styles',
    },
];

props.forEach((prop) => {
    describe(prop, () => {
        components.forEach(({ tagName, Ctor, name }) => {
            describe(name, () => {
                afterEach(() => {
                    // We keep a cache of parsed static fragments; these need to be reset between tests.
                    resetFragmentCache();
                    // Reset template object for clean state between tests
                    Ctor.resetTemplate();
                    resetAlreadyLoggedMessages();
                });

                it('W-16614556 should not render arbitrary content via stylesheet token', () => {
                    const elm = createElement(tagName, { is: Ctor });
                    elm.propToUse = prop;
                    let caughtError;
                    try {
                        document.body.appendChild(elm);
                    } catch (err) {
                        // Synthetic lifecycle throws the error synchronously on `appendChild`
                        caughtError = err;
                    }

                    expect(elm.shadowRoot.children.length).toBe(0); // does not render

                    expect(caughtError).not.toBeUndefined();
                    expect(caughtError.message).toMatch(
                        new RegExp(
                            [
                                // Different browsers have different error messages
                                'stylesheet token must be a valid string',
                                "Failed to execute 'setAttribute'",
                                'Invalid qualified name',
                                'Invalid attribute name',
                                'String contains an invalid character',
                                'The string contains invalid characters',
                            ]
                                .map(RegExp.escape)
                                .join('|')
                        )
                    );
                });
            });
        });
    });
});
