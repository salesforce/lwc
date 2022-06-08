// Error message differs between browsers
const alreadyUsedErrorMessage =
    /(has already been used with this registry|Cannot define multiple custom elements with the same tag name|has already been defined as a custom element)/;

function getCode(src) {
    return fetch(src)
        .then((resp) => resp.text())
        .then((engineCode) => engineCode.replace(/process\.env\.NODE_ENV/g, '"production"'));
}

function getEngineCode() {
    const engineDomSrc = document.querySelector('script[src*="engine-dom"]').src;
    const promises = [getCode(engineDomSrc)];
    if (!process.env.NATIVE_SHADOW) {
        const syntheticShadowSrc = document.querySelector('script[src*="synthetic-shadow"]').src;
        promises.unshift(getCode(syntheticShadowSrc));
    }
    return Promise.all(promises);
}

function createLWC(tagName, skipInject) {
    // basic Hello LWC compiled LWC component
    function tmpl($api) {
        const { t: api_text, h: api_element } = $api;
        return [api_element('h1', { key: 0 }, [api_text('Hello LWC')])];
    }

    LWC.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    LWC.freezeTemplate(tmpl);

    const Component = LWC.registerComponent(
        class MyLightningElement extends LWC.LightningElement {},
        {
            tmpl,
        }
    );

    const elm = LWC.createElement(tagName, { is: Component });
    if (!skipInject) {
        document.body.appendChild(elm);
    }
}

function createVanilla(tagName, skipInject) {
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
        return getEngineCode().then((scripts) => {
            engineScripts = scripts;
        });
    });

    describe('multiple copies of LWC engine loaded', () => {
        it('creates elements', () => {
            evaluate(engineScripts);
            evaluate(`(${createLWC})('x-foo')`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello LWC');
            evaluate(engineScripts);
            evaluate(`(${createLWC})('x-bar')`);
            expect(
                iframe.contentDocument.querySelector('x-bar').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello LWC');
        });

        it('errors on duplicate tag names', () => {
            evaluate(engineScripts);
            evaluate(`(${createLWC})('x-foo')`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello LWC');
            evaluate(engineScripts);
            expect(() => {
                evaluate(`(${createLWC})('x-foo')`);
            }).toThrowError(alreadyUsedErrorMessage);
        });
    });

    describe('custom element registered before LWC engine loads', () => {
        it('can register element when another element was registered before engine loaded', () => {
            evaluate(`(${createVanilla})('x-foo')`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
            evaluate(engineScripts);
            evaluate(`(${createLWC})('x-bar')`);
            expect(
                iframe.contentDocument.querySelector('x-bar').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello LWC');
        });

        it('throws error when another element with same tag name was registered before engine loaded', () => {
            evaluate(`(${createVanilla})('x-foo')`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
            evaluate(engineScripts);
            expect(() => {
                evaluate(`(${createLWC})('x-foo')`);
            }).toThrowError(alreadyUsedErrorMessage);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
        });

        it('can do customElements.get() for element registered before engine loads', () => {
            evaluate(`(${createVanilla})('x-foo')`);
            evaluate(engineScripts);
            const Ctor = evaluate(() => customElements.get('x-foo'));
            expect(Ctor.name).toEqual('MyCustomElement');
        });

        it('can upgrade elements that existed before engine loads - vanilla', () => {
            evaluate(() => document.body.appendChild(document.createElement('x-foo')));
            evaluate(engineScripts);
            evaluate(`(${createVanilla})('x-foo', true)`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Not LWC!');
        });

        // it('can upgrade elements that existed before engine loads - LWC', () => {
        //     evaluate(() => document.body.appendChild(document.createElement('x-foo')))
        //     evaluate(engineScripts)
        //     evaluate(`(${createLWC})('x-foo', true)`)
        //     expect(iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1').textContent).toEqual('Hello LWC')
        // })

        // it('can do customElements.whenDefined() for element registered before engine loads', () => {
        //     evaluate(`(${createVanilla})('x-foo')`)
        //     evaluate(engineScripts)
        //     const promise = evaluate(() => {
        //         return customElements.whenDefined('x-foo').then(ctor => {
        //             console.log('defined', ctor)
        //         })
        //     })
        //     return promise.then(Ctor => {
        //         expect(Ctor.name).toEqual('MyCustomElement')
        //     })
        // })
    });
});
