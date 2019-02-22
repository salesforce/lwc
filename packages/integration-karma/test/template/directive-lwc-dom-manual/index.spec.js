import { createElement } from 'test-utils';

import withLwcDomManual from 'x/withLwcDomManual';
import withoutLwcDomManual from 'x/withoutLwcDomManual';
import SvgWithLwcDomManual from 'x/svgWithLwcDomManual';
import withLwcDomManualNested from 'x/withLwcDomManualNested';

function waitForStyleToBeApplied() {
    // Using a timeout instead of a Promise.resolve to wait for the MutationObserver to be triggered.
    // The Promise polyfill on COMPAT browsers is based on MutationObserver. There are some timing issues between
    // Promise.resolve and MutationObserver callback invocation.
    return new Promise((resolve) => {
        setTimeout(resolve)
    });
}

describe('dom mutation without the lwc:dom="manual" directive', () => {
    function testErrorOnDomMutation(method, fn) {
        it(`should log an error when calling ${method} on an element without the lwc:dom="manual" directive`, () => {
            const root = createElement('x-without-lwc-dom-manual', { is: withoutLwcDomManual });
            document.body.appendChild(root);
            const elm = root.shadowRoot.querySelector('div');

            expect(
                () => fn(elm)
            ).toLogErrorDev(
                new RegExp(`\\[LWC error\\]: ${method} is disallowed in Element unless \`lwc:dom="manual"\` directive is used in the template.`)
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
        elm.innerHTML = `<div></div>`
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

    // TODO: #971 - Elements insert manually in lwc:dom="manual" are not patched with synthetic shadow polyfill
    xit('should return the right shadowRoot when invoking getRootNode() on inserted elements', () => {
        const root = createElement('x-test', { is: withLwcDomManual });
        document.body.appendChild(root);

        const elm = root.shadowRoot.querySelector('div');
        elm.innerHTML = '<div class="foo"></div>';

        expect(root.shadowRoot.querySelector('.foo').getRootNode()).toBe(root.shadowRoot);
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

// #1022 Support insertion of lwc element inside a node marked as lwc:dom="manual"
xdescribe('nested dynamic lwc elm with dom manual', () => {
    let outerElem;
    let innerElem;
    beforeEach(() => {
        outerElem = createElement('x-outer', { is: withLwcDomManual })
        document.body.appendChild(outerElem);
        innerElem = createElement('x-inner', { is: withLwcDomManualNested });
        const div = outerElem.shadowRoot.querySelector('div');
        div.appendChild(innerElem);
    });

    it('getRootNode() of inner custom element should return outer shadowRoot', () => {
        expect(innerElem.getRootNode()).toBe(outerElem.shadowRoot);
    })

    it('getRootNode() of inner shadow\'s template element should return inner shadowRoot', () => {
        const innerDiv = innerElem.shadowRoot.querySelector('div');
        expect(innerDiv.getRootNode()).toBe(innerElem.shadowRoot);
    });

    // Real issue is with MutationObserver
    it('getRootNode() of inner shadow\'s dynamic element should return inner shadowRoot', () => {
        const innerDiv = innerElem.shadowRoot.querySelector('div');
        innerDiv.innerHTML = '<p class="innerP"></p>';

        const p = innerElem.shadowRoot.querySelector('.innerP');
        expect(p.getRootNode()).toBe(innerElem.shadowRoot);
    });
});

// #1022 Support insertion of lwc element inside a node marked as lwc:dom="manual"
xdescribe('nested dynamic lwc elm without dom manual', () => {
    let outerElem;
    let innerElem;
    beforeEach(() => {
        outerElem = createElement('x-outer', { is: withLwcDomManual })
        document.body.appendChild(outerElem);
        innerElem = createElement('x-inner', { is: withoutLwcDomManual });
        const div = outerElem.shadowRoot.querySelector('div');
        div.appendChild(innerElem);
        // Ignore the engine warning that a node without lwc:dom="manual" is being manually changed
        spyOn(console, 'error');
    });

    it('getRootNode() of inner shadow element should return inner shadowRoot', () => {
        const innerDiv = innerElem.shadowRoot.querySelector('div');
        innerDiv.innerHTML = '<p class="innerP"></p>';
        const p = innerElem.shadowRoot.querySelector('.innerP');
        expect(p.getRootNode()).toBe(innerElem.shadowRoot);
    });
});
