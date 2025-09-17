import { resolvePathOutsideRoot } from '../../helpers/utils';

let engineDomCode, syntheticShadowCode;

// Error message differs between browsers
const tagAlreadyUsedErrorMessage =
    /(has already been used with this registry|Cannot define multiple custom elements with the same tag name|has already been defined as a custom element|This name is a registered custom element, preventing LWC to upgrade the element)/;

/** Fetches a text resource. */
async function getModuleCode(pkg) {
    const res = await fetch(resolvePathOutsideRoot(`../${pkg}/dist/index.cjs.js`));
    return await res.text();
}

/** Gets the contents of a set of script tags to insert on a page. */
async function getEngineCode() {
    engineDomCode = engineDomCode || (await getModuleCode('engine-dom'));

    syntheticShadowCode =
        syntheticShadowCode ||
        (!process.env.NATIVE_SHADOW && (await getModuleCode('synthetic-shadow')));

    return [
        `
        globalThis.process = { env: { NODE_ENV: "production" } };
        globalThis.LWC = globalThis.exports = {};
        globalThis.lwcRuntimeFlags = ${JSON.stringify(lwcRuntimeFlags)};
        `,
        syntheticShadowCode,
        engineDomCode,
    ].filter(Boolean);
}

/**
 * The text of a function that creates an LWC custom element.
 * The function is injected into an iframe, and must not reference any variables in this file.
 */
const injectableCreateLWC = String(function createLWC({
    tagName = 'x-foo',
    skipInject = false,
    text = 'Hello LWC',
    globalLWC = 'LWC',
    customElement = false,
} = {}) {
    // basic "Hello World" compiled LWC component
    function tmpl($api) {
        const { t: api_text, h: api_element } = $api;
        return [api_element('h1', { key: 0 }, [api_text(text)])];
    }

    const LWC = window[globalLWC];

    LWC.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    LWC.freezeTemplate(tmpl);

    const Component = LWC.registerComponent(
        class MyLightningElement extends LWC.LightningElement {},
        {
            tmpl,
        }
    );

    let elm;

    if (customElement) {
        customElements.define(tagName, Component.CustomElementConstructor);
        elm = document.createElement(tagName);
    } else {
        elm = LWC.createElement(tagName, { is: Component });
    }

    if (!skipInject) {
        document.body.appendChild(elm);
    }
});

/**
 * The text of a function that creates a vanilla custom element.
 * The function is injected into an iframe, and must not reference any variables in this file.
 */
const injectableCreateVanilla = String(function createVanilla({
    tagName = 'x-foo',
    skipInject = false,
} = {}) {
    customElements.define(
        tagName,
        class MyCustomElement extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' }).innerHTML = '<h1>Not LWC!</h1>';
            }
        }
    );
    if (!skipInject) {
        document.body.appendChild(document.createElement(tagName));
    }
});

describe('custom elements registry', () => {
    let iframe;
    let engineScripts;

    /** Runs `eval` in the iframe on a set of scripts. */
    function evaluate(scriptOrScripts) {
        const inputIsArray = Array.isArray(scriptOrScripts);
        const scripts = inputIsArray ? scriptOrScripts : [scriptOrScripts];
        const results = [];
        try {
            for (const script of scripts) {
                const scriptStr = typeof script === 'string' ? script : `(${script})()`;
                results.push(iframe.contentWindow.eval(scriptStr));
            }
        } catch (err) {
            // Rethrowing the error is necessary because otherwise Jasmine
            // gets confused by the iframe's Error object versus our Error object
            throw new Error(err.message);
        }
        return inputIsArray ? results : results[0];
    }

    // Create the iframe and load the basic set of scripts to inject
    beforeEach(async () => {
        iframe = document.createElement('iframe');
        document.body.appendChild(iframe);

        if (window.__coverage__) {
            // If istanbul coverage is enabled, we should proxy any calls in the iframe
            // to window.__coverage__ to the main one, so that the coverage is properly computed.
            iframe.contentWindow.__coverage__ = window.__coverage__;
        }

        engineScripts = await getEngineCode();
    });

    describe('basic', () => {
        it('can create elements', () => {
            evaluate(engineScripts);
            evaluate(`(${injectableCreateLWC})()`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello LWC');
        });
    });

    describe('two copies of LWC engine loaded', () => {
        [false, true].forEach((customElement) => {
            const testName = customElement
                ? 'with CustomElementConstructor'
                : 'with LWC.createElement';

            it(`creates elements in second engine - ${testName}`, () => {
                evaluate(engineScripts);
                evaluate(engineScripts);
                evaluate(`(${injectableCreateLWC})({ customElement: ${customElement} })`);
                expect(
                    iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                        .textContent
                ).toEqual('Hello LWC');
            });

            it(`creates elements in first engine - ${testName}`, () => {
                evaluate(engineScripts);
                evaluate('window.oldLWC = window.LWC');
                evaluate(engineScripts);
                evaluate(
                    `(${injectableCreateLWC})({ globalLWC: 'oldLWC', customElement: ${customElement} })`
                );
                expect(
                    iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                        .textContent
                ).toEqual('Hello LWC');
            });
        });
    });

    describe('custom element registered before LWC engine loads', () => {
        it('can register element when another element was registered before engine loaded', () => {
            evaluate(`(${injectableCreateVanilla})()`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
            evaluate(engineScripts);
            evaluate(`(${injectableCreateLWC})({ tagName: 'x-bar' })`);
            expect(
                iframe.contentDocument.querySelector('x-bar').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello LWC');
        });

        it('throws error when another element with same tag name was registered before engine loaded', () => {
            evaluate(`(${injectableCreateVanilla})()`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
            evaluate(engineScripts);
            expect(() => {
                evaluate(`(${injectableCreateLWC})()`);
            }).toThrowError(tagAlreadyUsedErrorMessage);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
        });

        it('can do customElements.get() for element registered before engine loads', () => {
            evaluate(`(${injectableCreateVanilla})()`);
            evaluate(engineScripts);
            const Ctor = evaluate(() => customElements.get('x-foo'));
            expect(Ctor.name).toEqual('MyCustomElement');
        });

        it('can upgrade elements that existed before engine loads - vanilla', () => {
            evaluate(() => document.body.appendChild(document.createElement('x-foo')));
            evaluate(engineScripts);
            evaluate(`(${injectableCreateVanilla})({ skipInject: true })`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
        });

        it('can upgrade multiple elements with same tag name that exist before engine loads - vanilla', () => {
            evaluate(() => {
                for (let i = 0; i < 2; i++) {
                    document.body.appendChild(document.createElement('x-foo'));
                }
            });
            evaluate(engineScripts);
            evaluate(`(${injectableCreateVanilla})({ skipInject: true })`);
            expect(
                [...iframe.contentDocument.querySelectorAll('x-foo')].map(
                    (_) => _.shadowRoot.querySelector('h1').textContent
                )
            ).toEqual(['Not LWC!', 'Not LWC!']);
        });

        it('can upgrade elements that existed before engine loads - LWC', () => {
            evaluate(() => document.body.appendChild(document.createElement('x-foo')));
            evaluate(engineScripts);
            evaluate(`(${injectableCreateLWC})({ skipInject: true })`);

            // TODO [#2970]: element is not upgraded
            expect(iframe.contentDocument.querySelector('x-foo').shadowRoot).toBeNull();
            // expect(iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1').textContent).toEqual('Hello LWC')
        });

        it('can do customElements.whenDefined() for element registered before engine loads', () => {
            evaluate(`(${injectableCreateVanilla})()`);
            evaluate(engineScripts);
            return evaluate(() => customElements.whenDefined('x-foo')).then((Ctor) => {
                expect(Ctor.name).toEqual('MyCustomElement');
            });
        });
    });

    describe('adoptedCallback', () => {
        describe('calls adoptedCallback when element moves between documents', () => {
            const injectableDefineVanillaAdopted = String(function defineVanillaAdopted() {
                customElements.define(
                    'x-adopted',
                    class extends HTMLElement {
                        constructor() {
                            super();
                            // avoid class properties so Babel doesn't transform this class
                            this._adopted = false;
                        }

                        adoptedCallback() {
                            this._adopted = true;
                        }
                    }
                );
                document.body.appendChild(document.createElement('x-adopted'));
            });

            const scenarios = [
                {
                    name: 'element defined before engine loads',
                    getScripts: () => [injectableDefineVanillaAdopted, engineScripts],
                },
                {
                    name: 'element defined after engine loads',
                    getScripts: () => [engineScripts, injectableDefineVanillaAdopted],
                },
            ];

            scenarios.forEach(({ name, getScripts }) => {
                it(name, () => {
                    for (const script of getScripts()) {
                        evaluate(script);
                    }
                    expect(evaluate(() => document.querySelector('x-adopted')._adopted)).toEqual(
                        false
                    );
                    const elm = iframe.contentDocument.querySelector('x-adopted');
                    elm.parentElement.removeChild(elm);
                    expect(elm._adopted).toEqual(false);
                    document.body.appendChild(elm);
                    expect(elm._adopted).toEqual(true);
                });
            });
        });

        it('does not call adoptedCallback if unnecessary', () => {
            evaluate(engineScripts);
            evaluate(`(${injectableCreateVanilla})()`);

            // We're basically just testing that this doesn't throw an error
            const elm = iframe.contentDocument.querySelector('x-foo');
            elm.parentElement.removeChild(elm);
            document.body.appendChild(elm);
        });
    });
});
