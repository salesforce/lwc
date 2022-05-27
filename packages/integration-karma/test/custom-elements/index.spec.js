import { createElement } from 'lwc';
import Nonce1 from 'x/nonce1';
import Nonce2 from 'x/nonce2';

const SUPPORTS_CUSTOM_ELEMENTS = !process.env.COMPAT && 'customElements' in window;

if (SUPPORTS_CUSTOM_ELEMENTS) {
    describe('customElements.get and customElements.whenDefined', () => {
        // Nonce elements should be defined only once in the entire Karma test suite
        const nonceElements = [
            { tag: 'x-nonce-1', Component: Nonce1 },
            { tag: 'x-nonce-2', Component: Nonce2 },
        ];

        // There are two ways that customElements.define can eventually get called:
        // 1) createElement
        // 2) explicit customElements.define
        const creators = [
            {
                method: 'using createElement',
                create: (tag, Component) => {
                    createElement(tag, { is: Component });
                },
            },
            {
                method: 'using CustomElementConstructor',
                create: (tag, Component) => {
                    customElements.define(tag, Component.CustomElementConstructor);
                },
            },
        ];

        creators.forEach(({ method, create }, i) => {
            const { tag, Component } = nonceElements[i];

            it(method, () => {
                expect(customElements.get(tag)).toBeUndefined();
                const promise = customElements.whenDefined(tag);
                expect(customElements.get(tag)).toBeUndefined();
                create(tag, Component);
                const Ctor = customElements.get(tag);
                expect(typeof Ctor).toEqual('function');
                return promise.then((Ctor) => {
                    expect(typeof Ctor).toEqual('function');
                });
            });
        });
    });

    describe('patched registry', () => {
        it('throws error for unsupported "extends" option', () => {
            const func = () => {
                customElements.define('x-unsupported-extends', class extends HTMLElement {}, {
                    extends: 'button',
                });
            };
            expect(func).toThrowError(DOMException);
            expect(func).toThrowError(
                'NotSupportedError: "extends" key in customElements.define() options is not supported.'
            );
        });
    });
}
