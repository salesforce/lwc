import { createElement } from 'lwc';
import Container from 'x/container';

describe('ShadowRoot.elementsFromPoint', () => {
    // The browsers disagree on whether elements _above_ the shadow root should also be included
    // when calling shadowRoot.elementsFromPoint(). Firefox only returns elements inside of the
    // immediate shadow root, whereas Chrome and Safari return elements above (outside) of that root.
    // https://crbug.com/1207863#c4
    let onlyIncludesElementsInImmediateShadowRoot = false;
    beforeAll(() => {
        if (process.env.NATIVE_SHADOW && !process.env.COMPAT) {
            // detect the Firefox behavior
            const div = document.createElement('div');
            div.attachShadow({ mode: 'open' }).innerHTML = '<div>foo</div>';
            document.body.appendChild(div);
            const { left, top } = div.shadowRoot.querySelector('div').getBoundingClientRect();
            const elements = div.shadowRoot.elementsFromPoint(left, top);
            document.body.removeChild(div);
            onlyIncludesElementsInImmediateShadowRoot = elements.length === 1;
        }
    });

    function test(element, expectedElements) {
        const { left, top, width, height } = element.getBoundingClientRect();
        const rootNode = element.getRootNode();
        const elementsFromPoint = rootNode.elementsFromPoint(left + width / 2, top + height / 2);

        if (onlyIncludesElementsInImmediateShadowRoot) {
            const mainRootNode = element.getRootNode();
            expectedElements = expectedElements.filter((el) => el.getRootNode() === mainRootNode);
        }

        expect(elementsFromPoint).toEqual(expectedElements);
    }

    it('returns correct elements for elementsFromPoint', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const { body } = document;
        const html = body.parentElement;
        const h1 = elm.shadowRoot.querySelector('h1');
        const inContainer = elm.shadowRoot.querySelector('.in-container');
        const slottable = elm.shadowRoot.querySelector('x-slottable');
        const slotted = elm.shadowRoot.querySelector('.slotted');
        const component = elm.shadowRoot.querySelector('x-component');
        const inComponent = component.shadowRoot.querySelector('.in-component');
        const inComponentInner = component.shadowRoot.querySelector('.in-component-inner');
        const slotWrapper = slottable.shadowRoot.querySelector('.slot-wrapper');
        const inSlottable = slottable.shadowRoot.querySelector('.in-slottable');
        const inSlottableInner = slottable.shadowRoot.querySelector('.in-slottable-inner');

        test(elm, [elm, body, html]);
        test(h1, [h1, elm, body, html]);
        test(inContainer, [slotted, slottable, inContainer, elm, body, html]);
        test(slottable, [slotted, slottable, inContainer, elm, body, html]);
        test(slotted, [slotted, slottable, inContainer, elm, body, html]);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrom/.test(navigator.userAgent);
        if (!isSafari) {
            // Safari has unpredictable behavior for these tests
            test(component, [component, slottable, inContainer, elm, body, html]);
            test(inComponent, [
                inComponentInner,
                inComponent,
                component,
                slottable,
                inContainer,
                elm,
                body,
                html,
            ]);
            test(inComponentInner, [
                inComponentInner,
                inComponent,
                component,
                slottable,
                inContainer,
                elm,
                body,
                html,
            ]);
            test(slotWrapper, [slotWrapper, slottable, inContainer, elm, body, html]);
            test(inSlottable, [inSlottable, slottable, inContainer, elm, body, html]);
            test(inSlottableInner, [
                inSlottableInner,
                inSlottable,
                slottable,
                inContainer,
                elm,
                body,
                html,
            ]);
        }
    });
});
