// fetch() does not work in IE
if (!process.env.COMPAT) {
    describe('multi-engine', () => {
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

        function helloWorld(lwc, tagName) {
            // basic hello world compiled LWC component
            function tmpl($api) {
                const { t: api_text, h: api_element } = $api;
                return [api_element('h1', { key: 0 }, [api_text('Hello world')])];
            }

            lwc.registerTemplate(tmpl);
            tmpl.stylesheets = [];
            lwc.freezeTemplate(tmpl);

            const Component = lwc.registerComponent(class extends lwc.LightningElement {}, {
                tmpl,
            });

            const elm = lwc.createElement(tagName, { is: Component });
            document.body.appendChild(elm);
        }

        it('works with multiple copies of the LWC engine loaded', () => {
            const iframe = document.createElement('iframe');
            iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');

            document.body.appendChild(iframe);

            return getEngineCode().then((scripts) => {
                const { contentWindow, contentDocument } = iframe;

                for (const script of scripts) {
                    contentWindow.eval(script);
                }
                contentWindow.eval('(' + helloWorld.toString() + ')(LWC, "x-foo");');
                expect(
                    contentDocument.querySelector('x-foo').shadowRoot.querySelector('h1')
                        .textContent
                ).toEqual('Hello world');
                for (const script of scripts) {
                    contentWindow.eval(script);
                }
                contentWindow.eval('(' + helloWorld.toString() + ')(LWC, "x-bar");');
                expect(
                    contentDocument.querySelector('x-bar').shadowRoot.querySelector('h1')
                        .textContent
                ).toEqual('Hello world');
            });
        });
    });
}
