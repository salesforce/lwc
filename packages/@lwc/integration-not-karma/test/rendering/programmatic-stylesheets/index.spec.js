import { createElement } from 'lwc';
import Basic from 'c/basic';
import Direct from 'c/direct';
import Scoped from 'c/scoped';
import InheritFromLightningElement from 'c/inheritFromLightningElement';
import Invalid from 'c/invalid';
import Invalid2 from 'c/invalid2';
import Invalid3 from 'c/invalid3';
import Inherit from 'c/inherit';
import Implicit from 'c/implicit';
import Multi from 'c/multi';
import MultiScoped from 'c/multiScoped';
import MultiStyles from 'c/multiStyles';
import MixedScopedAndUnscoped from 'c/mixedScopedAndUnscoped';
import StylesheetsMutation from 'c/stylesheetsMutation';

describe('programmatic stylesheets', () => {
    it('works for a basic usage of static stylesheets', async () => {
        const elm = createElement('c-basic', { is: Basic });
        document.body.appendChild(elm);
        const h1 = document.createElement('h1');
        document.body.appendChild(h1);

        await new Promise(requestAnimationFrame);
        expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toEqual(
            'rgb(255, 0, 0)'
        );
        // styles do not leak (e.g. synthetic shadow)
        expect(getComputedStyle(h1).color).toEqual('rgb(0, 0, 0)');
    });

    it('works for scoped stylesheets in light DOM', async () => {
        const elm = createElement('c-scoped', { is: Scoped });
        document.body.appendChild(elm);
        const h1 = document.createElement('h1');
        document.body.appendChild(h1);

        await new Promise(requestAnimationFrame);
        expect(getComputedStyle(elm.querySelector('h1')).color).toEqual('rgb(0, 128, 0)');
        // styles do not leak (e.g. synthetic shadow)
        expect(getComputedStyle(h1).color).toEqual('rgb(0, 0, 0)');
    });

    it('works if you do not wrap stylesheets in an explicit array', async () => {
        const elm = createElement('c-direct', { is: Direct });
        document.body.appendChild(elm);

        await new Promise(requestAnimationFrame);
        expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toEqual(
            'rgb(255, 0, 0)'
        );
    });

    it('works with multiple stylesheets', async () => {
        const elm = createElement('c-multi-styles', { is: MultiStyles });
        document.body.appendChild(elm);

        await new Promise(requestAnimationFrame);
        const style = getComputedStyle(elm.shadowRoot.querySelector('h1'));
        expect(style.color).toEqual('rgb(255, 0, 0)');
        expect(style.backgroundColor).toEqual('rgb(0, 128, 0)');
        expect(style.opacity).toEqual('0');
        expect(style.display).toEqual('block'); // last style wins
    });

    it('works with mixed scoped and unscoped in light dom', async () => {
        const elm = createElement('c-mixed-scoped-and-unscoped', { is: MixedScopedAndUnscoped });
        document.body.appendChild(elm);
        const h1 = document.createElement('h1');
        document.body.appendChild(h1);

        await new Promise(requestAnimationFrame);
        const style = getComputedStyle(elm.querySelector('h1'));
        expect(style.color).toEqual('rgb(255, 0, 0)');
        expect(style.backgroundColor).toEqual('rgb(0, 128, 0)');
        expect(style.opacity).toEqual('0');
        // styles only bleed for the unscoped styles
        const h1Style = getComputedStyle(h1);
        expect(h1Style.color).toEqual('rgb(0, 0, 0)');
        expect(h1Style.backgroundColor).toEqual('rgb(0, 128, 0)');
        expect(h1Style.opacity).toEqual('0');
    });

    describe('inheritance', () => {
        it('can attempt to inherit from lightning element which has no stylesheets', async () => {
            const elm = createElement('c-inherit-from-lightning-element', {
                is: InheritFromLightningElement,
            });
            document.body.appendChild(elm);

            await new Promise(requestAnimationFrame);
            expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toEqual(
                'rgb(255, 0, 0)'
            );
        });

        it('can inherit from superclass', async () => {
            const elm = createElement('c-inherit', {
                is: Inherit,
            });
            document.body.appendChild(elm);

            await new Promise(requestAnimationFrame);
            const style = getComputedStyle(elm.shadowRoot.querySelector('h1'));
            expect(style.color).toEqual('rgb(0, 0, 255)');
            expect(style.backgroundColor).toEqual('rgb(0, 128, 0)');
        });

        it('can override implicit styles due to ordering', async () => {
            const elm = createElement('c-implicit', {
                is: Implicit,
            });
            document.body.appendChild(elm);

            await new Promise(requestAnimationFrame);
            expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toEqual(
                'rgb(0, 0, 255)'
            );
        });
    });

    describe('multi-template components', () => {
        it('can override styles in a multi-template component', async () => {
            const elm = createElement('c-multi', {
                is: Multi,
            });
            document.body.appendChild(elm);

            // Insertion order is
            // 1. A
            // 2. static stylesheet (with A token, if synthetic shadow)
            // 3. B
            // 4. static stylesheet (with B token, if synthetic shadow)
            // In native shadow there are no tokens, so #4 never happens.

            await new Promise(requestAnimationFrame);
            const style = getComputedStyle(elm.shadowRoot.querySelector('h1'));
            expect(style.color).toEqual('rgb(0, 0, 255)');
            expect(style.backgroundColor).toEqual('rgb(255, 215, 0)');
            elm.next();
            await Promise.resolve();
            const style_1 = getComputedStyle(elm.shadowRoot.querySelector('h1'));
            // See above note about native vs synthetic shadow
            expect(style_1.color).toEqual(
                process.env.NATIVE_SHADOW ? 'rgb(0, 128, 0)' : 'rgb(0, 0, 255)'
            );
            expect(style_1.backgroundColor).toEqual('rgb(250, 128, 114)');
        });

        it('can override scoped styles in a multi-template component', async () => {
            const elm = createElement('c-multi-scoped', {
                is: MultiScoped,
            });
            document.body.appendChild(elm);

            // Insertion order is
            // 1. A
            // 2. static stylesheet with A token
            // 3. B
            // 4. static stylesheet with B token

            await new Promise(requestAnimationFrame);
            const style = getComputedStyle(elm.shadowRoot.querySelector('h1'));
            expect(style.color).toEqual('rgb(0, 0, 255)');
            expect(style.backgroundColor).toEqual('rgb(255, 215, 0)');
            elm.next();
            await Promise.resolve();
            const style_1 = getComputedStyle(elm.shadowRoot.querySelector('h1'));
            expect(style_1.color).toEqual('rgb(0, 0, 255)');
            expect(style_1.backgroundColor).toEqual('rgb(250, 128, 114)');
        });
    });

    describe('errors', () => {
        it('throws error if stylesheets is a string', () => {
            let elm;
            expect(() => {
                elm = createElement('c-invalid', {
                    is: Invalid,
                });
            }).toLogErrorDev(
                /\[LWC error]: static stylesheets must be an array of CSS stylesheets. Found invalid stylesheets on <c-invalid>/
            );

            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelector('h1')).toBeTruthy(); // still renders the template correctly
        });

        it('throws error if stylesheets is an array of strings', () => {
            let elm;
            expect(() => {
                elm = createElement('c-invalid2', {
                    is: Invalid2,
                });
            }).toLogErrorDev(
                /\[LWC error]: static stylesheets must be an array of CSS stylesheets. Found invalid stylesheets on <c-invalid2>/
            );

            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelector('h1')).toBeTruthy(); // still renders the template correctly
        });

        it('warn if stylesheets is mutated', () => {
            let elm;
            expect(() => {
                elm = createElement('c-stylesheets-mutation', {
                    is: StylesheetsMutation,
                });
                document.body.appendChild(elm);
            }).toLogWarningDev(
                /\[LWC warn]: Dynamically setting the "stylesheets" static property on StylesheetsMutation will not affect the stylesheets injected./
            );

            expect(elm.shadowRoot.querySelector('h1')).toBeTruthy(); // still renders the template correctly
        });

        // TODO [#3122]: Disallow treating arbitrary functions as stylesheet functions
        it('no error thrown if stylesheets is an array of arbitrary functions', () => {
            let elm;
            expect(() => {
                elm = createElement('c-invalid3', {
                    is: Invalid3,
                });
            }).not.toLogErrorDev();

            document.body.appendChild(elm);
            expect(elm.shadowRoot.querySelector('h1')).toBeTruthy(); // still renders the template correctly
        });
    });
});
