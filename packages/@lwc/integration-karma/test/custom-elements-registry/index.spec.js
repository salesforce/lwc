// Error message differs between browsers
const tagAlreadyUsedErrorMessage =
    /(has already been used with this registry|Cannot define multiple custom elements with the same tag name|has already been defined as a custom element|This name is a registered custom element, preventing LWC to upgrade the element)/;

function getCode(src) {
    return fetch(src).then((resp) => resp.text());
}

function getEngineCode() {
    const engineDomSrc = document.querySelector('script[src*="engine-dom"]').src;

    const syntheticShadowSrc =
        !process.env.NATIVE_SHADOW &&
        getCode(document.querySelector('script[src*="synthetic-shadow"]').src);

    const scripts = [
        `window.process = { env: { NODE_ENV: "production" } };`,
        `window.lwcRuntimeFlags = ${JSON.stringify(window.lwcRuntimeFlags)};`, // copy runtime flags to iframe
        syntheticShadowSrc,
        getCode(engineDomSrc),
    ].filter(Boolean);
    return Promise.all(scripts);
}

function createLWC({
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
}

function createVanilla({ tagName = 'x-foo', skipInject = false } = {}) {
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
}

describe('custom elements registry', () => {
    let iframe;
    let engineScripts;

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

    beforeEach(() => {
        iframe = document.createElement('iframe');
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
        document.body.appendChild(iframe);

        if (window.__coverage__) {
            // If istanbul coverage is enabled, we should proxy any calls in the iframe
            // to window.__coverage__ to the main one, so that the coverage is properly computed.
            iframe.contentWindow.__coverage__ = window.__coverage__;
        }

        return getEngineCode().then((scripts) => {
            engineScripts = scripts;
        });
    });

    describe('basic', () => {
        it('can create elements', () => {
            evaluate(engineScripts);
            evaluate(`(${createLWC})()`);
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
                evaluate(`(${createLWC})({ customElement: ${customElement} })`);
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
                    `(${createLWC})({ globalLWC: 'oldLWC', customElement: ${customElement} })`
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
            evaluate(`(${createVanilla})()`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
            evaluate(engineScripts);
            evaluate(`(${createLWC})({ tagName: 'x-bar' })`);
            expect(
                iframe.contentDocument.querySelector('x-bar').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello LWC');
        });

        it('throws error when another element with same tag name was registered before engine loaded', () => {
            evaluate(`(${createVanilla})()`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
            evaluate(engineScripts);
            expect(() => {
                evaluate(`(${createLWC})()`);
            }).toThrowError(tagAlreadyUsedErrorMessage);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
        });

        it('can do customElements.get() for element registered before engine loads', () => {
            evaluate(`(${createVanilla})()`);
            evaluate(engineScripts);
            const Ctor = evaluate(() => customElements.get('x-foo'));
            expect(Ctor.name).toEqual('MyCustomElement');
        });

        it('can upgrade elements that existed before engine loads - vanilla', () => {
            evaluate(() => document.body.appendChild(document.createElement('x-foo')));
            evaluate(engineScripts);
            evaluate(`(${createVanilla})({ skipInject: true })`);
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
            evaluate(`(${createVanilla})({ skipInject: true })`);
            expect(
                [...iframe.contentDocument.querySelectorAll('x-foo')].map(
                    (_) => _.shadowRoot.querySelector('h1').textContent
                )
            ).toEqual(['Not LWC!', 'Not LWC!']);
        });

        it('can upgrade elements that existed before engine loads - LWC', () => {
            evaluate(() => document.body.appendChild(document.createElement('x-foo')));
            evaluate(engineScripts);
            evaluate(`(${createLWC})({ skipInject: true })`);

            // TODO [#2970]: element is not upgraded
            expect(iframe.contentDocument.querySelector('x-foo').shadowRoot).toBeNull();
            // expect(iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1').textContent).toEqual('Hello LWC')
        });

        it('can do customElements.whenDefined() for element registered before engine loads', () => {
            evaluate(`(${createVanilla})()`);
            evaluate(engineScripts);
            return evaluate(() => customElements.whenDefined('x-foo')).then((Ctor) => {
                expect(Ctor.name).toEqual('MyCustomElement');
            });
        });
    });

    describe('adoptedCallback', () => {
        describe('calls adoptedCallback when element moves between documents', () => {
            function defineVanillaAdopted() {
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
            }

            const scenarios = [
                {
                    name: 'element defined before engine loads',
                    getScripts: () => [defineVanillaAdopted, engineScripts],
                },
                {
                    name: 'element defined after engine loads',
                    getScripts: () => [engineScripts, defineVanillaAdopted],
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
            evaluate(`(${createVanilla})()`);

            // We're basically just testing that this doesn't throw an error
            const elm = iframe.contentDocument.querySelector('x-foo');
            elm.parentElement.removeChild(elm);
            document.body.appendChild(elm);
        });
    });
});
