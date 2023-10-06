import { createElement } from 'lwc';

import withLwcDomManual from 'x/withLwcDomManual';
import withoutLwcDomManual from 'x/withoutLwcDomManual';
import SvgWithLwcDomManual from 'x/svgWithLwcDomManual';

function waitForStyleToBeApplied() {
    return Promise.resolve();
}

describe('dom mutation without the lwc:dom="manual" directive', () => {
    function testErrorOnDomMutation(method, fn) {
        it(`should log a warning when calling ${method} on an element without the lwc:dom="manual" directive only in synthetic mode`, () => {
            const root = createElement('x-without-lwc-dom-manual', { is: withoutLwcDomManual });
            document.body.appendChild(root);
            const elm = root.shadowRoot.querySelector('div');

            // eslint-disable-next-line jest/valid-expect
            let expected = expect(() => fn(elm));
            if (process.env.NATIVE_SHADOW) {
                expected = expected.not; // no error
            }
            expected.toLogWarningDev(
                new RegExp(
                    `\\[LWC warn\\]: The \`${method}\` method is available only on elements that use the \`lwc:dom="manual"\` directive.`
                )
            );
        });
    }

    testErrorOnDomMutation('appendChild', (elm) => {
        const child = document.createElement('div');
        elm.appendChild(child);
    });

    testErrorOnDomMutation('insertBefore', (elm) => {
        const child = document.createElement('div');
        const span = elm.firstElementChild;
        elm.insertBefore(child, span);
    });

    testErrorOnDomMutation('removeChild', (elm) => {
        const span = elm.firstElementChild;
        elm.removeChild(span);
    });

    testErrorOnDomMutation('replaceChild', (elm) => {
        const child = document.createElement('div');
        const span = elm.firstElementChild;
        elm.replaceChild(child, span);
    });
});

describe('dom mutation with the lwc:dom="manual" directive', () => {
    function testAllowDomMutationWithLwcDomDirective(method, fn) {
        it(`should not log an error when calling ${method} on an element with the lwc:dom="manual" directive`, () => {
            const root = createElement('x-with-lwc-dom-manual', { is: withLwcDomManual });
            document.body.appendChild(root);

            spyOn(console, 'error');

            const elm = root.shadowRoot.querySelector('div');
            fn(elm);

            /* eslint-disable-next-line no-console */
            expect(console.error).not.toHaveBeenCalled();
        });
    }

    testAllowDomMutationWithLwcDomDirective('appendChild', (elm) => {
        const child = document.createElement('div');
        elm.appendChild(child);
    });

    testAllowDomMutationWithLwcDomDirective('innerHTML', (elm) => {
        elm.innerHTML = `<div></div>`;
    });

    it('#874 - should not warn when removing a node previously inserted in an element with the lwc:dom="manual" directive', () => {
        const root = createElement('x-test', { is: withLwcDomManual });
        document.body.appendChild(root);

        spyOn(console, 'error');

        const elm = root.shadowRoot.querySelector('div');
        const child = document.createElement('div');

        elm.appendChild(child);
        elm.removeChild(child);

        /* eslint-disable-next-line no-console */
        expect(console.error).not.toHaveBeenCalled();
    });

    it('#879 - should not throw when a mutated child was removed sync after being updated', () => {
        const root = createElement('x-test', { is: withLwcDomManual });
        document.body.appendChild(root);

        spyOn(console, 'error');

        const elm = root.shadowRoot.querySelector('div');

        const div = document.createElement('div');
        div.innerHTML = '<span>span</span>';
        const span = div.querySelector('span');

        elm.appendChild(div);
        span.textContent = '';
        span.parentNode.removeChild(span);

        /* eslint-disable-next-line no-console */
        expect(console.error).not.toHaveBeenCalled();
    });
});

describe('adopt node in the shadow', () => {
    it('should returns the return the inserted elements when querying using querySelector', () => {
        const root = createElement('x-test', { is: withLwcDomManual });
        document.body.appendChild(root);

        const elm = root.shadowRoot.querySelector('div');
        elm.innerHTML = '<div class="outer"><div class="inner"></div></div>';

        const outer = root.shadowRoot.querySelector('.outer');
        expect(outer).not.toBe(null);
        expect(outer.parentElement).toBe(elm);

        const inner = root.shadowRoot.querySelector('.inner');
        expect(inner).not.toBe(null);
        expect(inner.parentElement.parentElement).toBe(elm);
    });

    it('should apply the component styles to inserted elements', () => {
        const root = createElement('x-test', { is: withLwcDomManual });
        document.body.appendChild(root);

        const elm = root.shadowRoot.querySelector('div');
        elm.innerHTML = '<div class="foo"></div>';

        return waitForStyleToBeApplied().then(() => {
            expect(window.getComputedStyle(elm.firstElementChild).fontSize).toBe('10px');
        });
    });

    it('#871 - should apply style to inserted SVG elements', () => {
        const root = createElement('x-test', { is: SvgWithLwcDomManual });
        document.body.appendChild(root);

        const svgElm = root.shadowRoot.querySelector('svg');
        svgElm.innerHTML = '<rect></rect>';

        return waitForStyleToBeApplied().then(() => {
            // Use firstChild instead of firstElementChild since accessing firstElementChild in an SVG element on
            // IE11 throws an error.
            expect(window.getComputedStyle(svgElm.firstChild).fill).toBe('rgb(0, 255, 0)');
        });
    });
});
