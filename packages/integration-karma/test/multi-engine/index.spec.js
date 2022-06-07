// fetch() does not work in IE
if (!process.env.COMPAT) {
    describe('multiple copies of LWC engine loaded', () => {
        function getCode(src) {
            return fetch(src)
                .then((resp) => resp.text())
                .then((engineCode) =>
                    engineCode.replace(/process\.env\.NODE_ENV/g, '"production"')
                );
        }

        function getEngineCode() {
            const engineDomSrc = document.querySelector('script[src*="engine-dom"]').src;
            const promises = [getCode(engineDomSrc)];
            if (!process.env.NATIVE_SHADOW) {
                const syntheticShadowSrc = document.querySelector(
                    'script[src*="synthetic-shadow"]'
                ).src;
                promises.unshift(getCode(syntheticShadowSrc));
            }
            return Promise.all(promises);
        }

        function helloWorld(tagName) {
            // basic hello world compiled LWC component
            function tmpl($api) {
                const { t: api_text, h: api_element } = $api;
                return [api_element('h1', { key: 0 }, [api_text('Hello world')])];
            }

            LWC.registerTemplate(tmpl);
            tmpl.stylesheets = [];
            LWC.freezeTemplate(tmpl);

            const Component = LWC.registerComponent(class extends LWC.LightningElement {}, {
                tmpl,
            });

            const elm = LWC.createElement(tagName, { is: Component });
            document.body.appendChild(elm);
        }

        let iframe;
        let engineScripts;

        function evaluate(scriptOrScripts) {
            if (!Array.isArray(scriptOrScripts)) {
                scriptOrScripts = [scriptOrScripts];
            }
            for (const script of scriptOrScripts) {
                iframe.contentWindow.eval(script);
            }
        }

        beforeEach(() => {
            iframe = document.createElement('iframe');
            iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');

            document.body.appendChild(iframe);
            return getEngineCode().then((scripts) => {
                engineScripts = scripts;
            });
        });

        it('creates elements', () => {
            evaluate(engineScripts);
            evaluate(`(${helloWorld})('x-foo')`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello world');
            evaluate(engineScripts);
            evaluate(`(${helloWorld})('x-bar')`);
            expect(
                iframe.contentDocument.querySelector('x-bar').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello world');
        });

        it('errors on duplicate tag names', () => {
            evaluate(engineScripts);
            evaluate(`(${helloWorld})('x-foo')`);
            expect(
                iframe.contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                    .textContent
            ).toEqual('Hello world');
            evaluate(engineScripts);
            expect(() => {
                try {
                    evaluate(`(${helloWorld})('x-foo')`);
                } catch (err) {
                    // Rethrowing the error is necessary because otherwise Jasmine
                    // gets confused by the iframe's Error object versus our Error object
                    throw new Error(err.message);
                }
            }).toThrowError(/the name "x-foo" has already been used with this registry/);
        });
    });
}
