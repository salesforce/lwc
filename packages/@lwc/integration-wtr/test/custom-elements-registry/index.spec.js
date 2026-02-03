import { resolvePathOutsideRoot } from '../../helpers/utils';

// Error message differs between browsers
const tagAlreadyUsedErrorMessage =
    /(has already been used with this registry|Cannot define multiple custom elements with the same tag name|has already been defined as a custom element|This name is a registered custom element, preventing LWC to upgrade the element)/;

/** Fetches a text resource. */
async function getModuleCode(pkg) {
    const res = await fetch(resolvePathOutsideRoot(`../${pkg}/dist/index.cjs`));
    const code = await res.text();
    // CommonJS code needs to have `exports` defined, so we wrap in an IIFE
    // to provide it and to encapsulate the code.
    return `((exports) => {
        ${code};
        return exports;
    })({});`;
}

/** Gets the contents of a set of script tags to insert on a page. */
async function getEngineCode() {
    const engineDom = await getModuleCode('engine-dom');

    const syntheticShadow = process.env.NATIVE_SHADOW
        ? ''
        : await getModuleCode('synthetic-shadow');

    return `(() => {
        globalThis.process = { env: { NODE_ENV: "production" } };
        globalThis.lwcRuntimeFlags = ${JSON.stringify(lwcRuntimeFlags)};
        ${syntheticShadow};
        globalThis.LWC = ${engineDom};
    })();`;
}

/**
 * The text of a function that creates an LWC custom element.
 * The function is injected into an iframe, and must not reference any variables in this file.
 */
const injectableCreateLWC = String(function createLWC({
    tagName = 'x-foo',
    skipInject = false,
    globalLWC = 'LWC',
    customElement = false,
} = {}) {
    // basic "Hello World" compiled LWC component
    function tmpl($api) {
        const { t: api_text, h: api_element } = $api;
        return [api_element('h1', { key: 0 }, [api_text('Hello LWC')])];
    }

    const lwc = window[globalLWC];

    lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    lwc.freezeTemplate(tmpl);

    const Component = lwc.registerComponent(
        class MyLightningElement extends lwc.LightningElement {},
        { tmpl }
    );

    let elm;

    if (customElement) {
        customElements.define(tagName, Component.CustomElementConstructor);
        elm = document.createElement(tagName);
    } else {
        elm = lwc.createElement(tagName, { is: Component });
    }

    if (!skipInject) {
        document.body.appendChild(elm);
    }
});

/**
 * The text of a function that creates a vanilla custom element.
 * The function is injected into an iframe, and must not reference any variables in this file.
 */
const injectableCreateVanilla = String(function createVanilla({ skipInject = false } = {}) {
    const tagName = 'x-foo';
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

/**
 * The text of a function that creates a vanilla custom element with an `adoptedCallback`.
 * The function is injected into an iframe, and must not reference any variables in this file.
 */
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

describe('custom elements registry', () => {
    let iframe;
    let engineCode;

    /** Run `eval` on the LWC engine code to inject it into the iframe. */
    function injectEngine() {
        iframe.contentWindow.eval(engineCode);
    }

    /**
     * Evaluate a function in the iframe context. All referenced values must exist in the iframe,
     * not in this source file.
     * @param {string|Function} fn
     * @param  {...any} args JSON-serializable function parameters
     */
    function callInIframe(fn, ...args) {
        const strargs = JSON.stringify(args).slice(1, -1); // remove [ and ]
        const script = `(${fn})(${strargs});`;
        return iframe.contentWindow.eval(script);
    }

    beforeAll(async () => {
        engineCode = await getEngineCode();
    });

    beforeEach(async () => {
        iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
    });

    describe('basic', () => {
        it('can create elements', () => {
            injectEngine();
            callInIframe(injectableCreateLWC);

            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello LWC');
        });
    });

    describe('two copies of LWC engine loaded', () => {
        const scenarios = [
            { customElement: false, description: 'with LWC.createElement' },
            { customElement: true, description: 'with CustomElementConstructor' },
        ];

        scenarios.forEach(({ customElement, description }) => {
            it(`creates elements in second engine - ${description}`, () => {
                injectEngine();
                injectEngine();
                callInIframe(injectableCreateLWC, { customElement });

                expect(
                    iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                        .textContent
                ).toEqual('Hello LWC');
            });

            it(`creates elements in first engine - ${description}`, () => {
                injectEngine();
                callInIframe(() => {
                    globalThis.oldLWC = globalThis.LWC;
                });
                injectEngine();
                callInIframe(injectableCreateLWC, { customElement, globalLWC: 'oldLWC' });

                const text = iframe.contentDocument
                    .querySelector('x-foo')
                    .shadowRoot.querySelector('h1').textContent;
                expect(text).toEqual('Hello LWC');
            });
        });
    });

    describe('custom element registered before LWC engine loads', () => {
        it('can register element when another element was registered before engine loaded', () => {
            callInIframe(injectableCreateVanilla);

            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');

            injectEngine();
            callInIframe(injectableCreateLWC, { tagName: 'x-bar' });

            expect(
                iframe.contentDocument.querySelector('x-bar').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello LWC');
        });

        it('throws error when another element with same tag name was registered before engine loaded', () => {
            callInIframe(injectableCreateVanilla);

            let text = iframe.contentDocument
                .querySelector('x-foo')
                .shadowRoot.querySelector('h1').textContent;
            expect(text).toEqual('Not LWC!');

            injectEngine();

            expect(() => callInIframe(injectableCreateLWC)).toThrowError(
                tagAlreadyUsedErrorMessage
            );
            text = iframe.contentDocument
                .querySelector('x-foo')
                .shadowRoot.querySelector('h1').textContent;
            expect(text).toEqual('Not LWC!');
        });

        it('can do customElements.get() for element registered before engine loads', () => {
            callInIframe(injectableCreateVanilla);
            injectEngine();
            const Ctor = callInIframe(() => customElements.get('x-foo'));

            expect(Ctor.name).toEqual('MyCustomElement');
        });

        it('can upgrade elements that existed before engine loads - vanilla', () => {
            callInIframe(() => document.body.appendChild(document.createElement('x-foo')));
            injectEngine();
            callInIframe(injectableCreateVanilla, { skipInject: true });

            const text = iframe.contentDocument
                .querySelector('x-foo')
                .shadowRoot.querySelector('h1').textContent;
            expect(text).toEqual('Not LWC!');
        });

        it('can upgrade multiple elements with same tag name that exist before engine loads - vanilla', () => {
            callInIframe(() => {
                document.body.appendChild(document.createElement('x-foo'));
                document.body.appendChild(document.createElement('x-foo'));
            });
            injectEngine();
            callInIframe(injectableCreateVanilla, { skipInject: true });

            const allText = Array.from(
                iframe.contentDocument.querySelectorAll('x-foo'),
                (xFoo) => xFoo.shadowRoot.querySelector('h1').textContent
            );
            expect(allText).toEqual(['Not LWC!', 'Not LWC!']);
        });

        it('can upgrade elements that existed before engine loads - LWC', () => {
            callInIframe(() => document.body.appendChild(document.createElement('x-foo')));
            injectEngine();
            callInIframe(injectableCreateLWC, { skipInject: true });

            // TODO [#2970]: element is not upgraded
            expect(iframe.contentDocument.querySelector('x-foo').shadowRoot).toBeNull();
            // expect(iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1').textContent).toEqual('Hello LWC')
        });

        it('can do customElements.whenDefined() for element registered before engine loads', async () => {
            callInIframe(injectableCreateVanilla);
            injectEngine();
            const Ctor = await callInIframe(async () => await customElements.whenDefined('x-foo'));

            expect(Ctor.name).toEqual('MyCustomElement');
        });
    });

    describe('adoptedCallback', () => {
        describe('calls adoptedCallback when element moves between documents', () => {
            const scenarios = [
                {
                    name: 'element defined before engine loads',
                    setup() {
                        callInIframe(injectableDefineVanillaAdopted);
                        injectEngine();
                    },
                },
                {
                    name: 'element defined after engine loads',
                    setup() {
                        injectEngine();
                        callInIframe(injectableDefineVanillaAdopted);
                    },
                },
            ];

            scenarios.forEach(({ name, setup }) => {
                it(name, () => {
                    setup();

                    const adopted = callInIframe(
                        () => document.querySelector('x-adopted')._adopted
                    );
                    expect(adopted).toEqual(false);

                    const elm = iframe.contentDocument.querySelector('x-adopted');
                    elm.parentElement.removeChild(elm);
                    expect(elm._adopted).toEqual(false);

                    document.body.appendChild(elm);
                    expect(elm._adopted).toEqual(true);
                });
            });
        });

        it('does not call adoptedCallback if unnecessary', () => {
            injectEngine();
            callInIframe(injectableCreateVanilla);

            // No assertion because we're basically just testing that this doesn't throw an error
            const elm = iframe.contentDocument.querySelector('x-foo');
            elm.parentElement.removeChild(elm);
            document.body.appendChild(elm);
        });
    });
});
