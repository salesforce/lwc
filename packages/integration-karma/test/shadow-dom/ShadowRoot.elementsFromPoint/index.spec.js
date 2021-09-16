import { createElement } from 'lwc';
import Container from 'x/container';
import { extractShadowDataIds } from 'test-utils';

describe('elementsFromPoint', () => {
    // Safari <v11 does not support this API
    function supportsElementsFromPoint() {
        try {
            document.elementsFromPoint(0, 0);
            return true;
        } catch (err) {
            /* ignore */
        }
        return false;
    }

    // The browsers disagree on whether elements _above_ the shadow root should also be included
    // when calling shadowRoot.elementsFromPoint(). Firefox only returns elements inside of the
    // immediate shadow root, whereas Chrome and Safari return elements above (outside) of that root.
    // https://crbug.com/1207863#c4
    const onlyIncludesElementsInImmediateShadowRoot = (() => {
        function detect() {
            if (!process.env.NATIVE_SHADOW_MODE) {
                return false; // in synthetic shadow we control the behavior, so we match Chrome/Safari
            }
            // detect the Firefox behavior
            const div = document.createElement('div');
            div.attachShadow({ mode: 'open' }).innerHTML = '<div>foo</div>';
            document.body.appendChild(div);
            const { left, top, width, height } = div.shadowRoot
                .querySelector('div')
                .getBoundingClientRect();
            const elements = div.shadowRoot.elementsFromPoint(left + width / 2, top + height / 2);
            document.body.removeChild(div);
            return elements.length === 1;
        }

        let cachedResult;
        return () => {
            if (typeof cachedResult === 'undefined') {
                cachedResult = detect();
            }
            return cachedResult;
        };
    })();

    function test(element, expectedElements) {
        const { left, top, width, height } = element.getBoundingClientRect();
        const rootNode = element.getRootNode();
        const elementsFromPoint = rootNode.elementsFromPoint(left + width / 2, top + height / 2);

        if (onlyIncludesElementsInImmediateShadowRoot()) {
            const mainRootNode = element.getRootNode();
            expectedElements = expectedElements.filter((el) => el.getRootNode() === mainRootNode);
        }

        expect(elementsFromPoint).toEqual(expectedElements);
    }

    if (supportsElementsFromPoint()) {
        // Safari <v11 doesn't support elementsFromPoint
        it('non-shadow example', () => {
            const div = document.createElement('div');
            div.textContent = 'foo';
            document.body.appendChild(div);

            const { left, top, width, height } = div.getBoundingClientRect();
            const elementsFromPoint = document.elementsFromPoint(
                left + width / 2,
                top + height / 2
            );

            expect(elementsFromPoint).toEqual([div, document.body, document.documentElement]);
        });

        it('shadow example', () => {
            const elm = createElement('x-container', { is: Container });
            document.body.appendChild(elm);
            const nodes = extractShadowDataIds(elm.shadowRoot);

            const { body } = document;
            const html = document.documentElement;
            const {
                aboveContainer,
                inContainer,
                slottable,
                aroundSlotted,
                slotted,
                inSlotted,
                slotWrapper,
                inSlottable,
                inSlottableInner,
            } = nodes;

            test(elm, [elm, body, html]);
            test(aboveContainer, [aboveContainer, elm, body, html]);
            test(inContainer, [slottable, inContainer, elm, body, html]);
            test(slottable, [slottable, inContainer, elm, body, html]);
            test(aroundSlotted, [slotted, aroundSlotted, slottable, inContainer, elm, body, html]);
            test(slotted, [slotted, aroundSlotted, slottable, inContainer, elm, body, html]);
            test(inSlotted, [
                inSlotted,
                slotted,
                aroundSlotted,
                slottable,
                inContainer,
                elm,
                body,
                html,
            ]);
            test(slotWrapper, [
                slotted,
                aroundSlotted,
                slotWrapper,
                slottable,
                inContainer,
                elm,
                body,
                html,
            ]);
            test(inSlottable, [
                inSlottableInner,
                inSlottable,
                slottable,
                inContainer,
                elm,
                body,
                html,
            ]);
            test(inSlottableInner, [
                inSlottableInner,
                inSlottable,
                slottable,
                inContainer,
                elm,
                body,
                html,
            ]);
        });
    }
});
