import { createElement } from 'lwc';
import Container from 'x/container';
import Grandparent from 'x/grandparent';
import { extractShadowDataIds } from 'test-utils';

// The browsers disagree on whether elements _above_ the shadow root should also be included
// when calling shadowRoot.elementsFromPoint(). Firefox only returns elements inside of the
// immediate shadow root, whereas Chrome and Safari return elements above (outside) of that root.
// https://crbug.com/1207863#c4
const onlyIncludesElementsInImmediateShadowRoot = (() => {
    function detect() {
        if (!process.env.NATIVE_SHADOW) {
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

/**
 * Tests the elementsFromPoint method on a given root node.
 *
 * @param {ShadowRoot} rootNode - The root node to test the elementsFromPoint method on.
 * @param {number} x - The x-coordinate for the elementsFromPoint method.
 * @param {number} y - The y-coordinate for the elementsFromPoint method.
 * @param {Element[]} expectedElements - The array of elements expected to be returned by the elementsFromPoint method.
 */
function testElementsFromPoint(rootNode, x, y, expectedElements) {
    const elementsFromPoint = rootNode.elementsFromPoint(x, y);

    if (onlyIncludesElementsInImmediateShadowRoot()) {
        expectedElements = expectedElements.filter((el) => el.getRootNode() === rootNode);
    }

    expect(elementsFromPoint).toEqual(expectedElements);
}

// Safari <v11 doesn't support elementsFromPoint
it('non-shadow example', () => {
    const div = document.createElement('div');
    div.textContent = 'foo';
    document.body.appendChild(div);

    const { left, top, width, height } = div.getBoundingClientRect();
    const elementsFromPoint = document.elementsFromPoint(left + width / 2, top + height / 2);

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

    function check(element, expectedElements) {
        const { left, top, width, height } = element.getBoundingClientRect();
        const rootNode = element.getRootNode();
        const x = left + width / 2;
        const y = top + height / 2;
        testElementsFromPoint(rootNode, x, y, [...expectedElements, elm, body, html]);
    }

    check(elm, []);
    check(aboveContainer, [aboveContainer]);
    check(inContainer, [slottable, inContainer]);
    check(slottable, [slottable, inContainer]);
    check(aroundSlotted, [slotted, aroundSlotted, slottable, inContainer]);
    check(slotted, [slotted, aroundSlotted, slottable, inContainer]);
    check(inSlotted, [inSlotted, slotted, aroundSlotted, slottable, inContainer]);
    check(slotWrapper, [slotted, aroundSlotted, slotWrapper, slottable, inContainer]);
    check(inSlottable, [inSlottableInner, inSlottable, slottable, inContainer]);
    check(inSlottableInner, [inSlottableInner, inSlottable, slottable, inContainer]);
});

it('host elements are not all visible', () => {
    const grandparent = createElement('x-grandparent', { is: Grandparent });
    document.body.appendChild(grandparent);
    const nodes = extractShadowDataIds(grandparent.shadowRoot);
    const { child, childDiv, parent, parentDiv, grandparentDiv } = nodes;
    const html = document.documentElement;

    const resetStyles = () => {
        [child, childDiv, parent, parentDiv, grandparent, grandparentDiv].forEach((el) => {
            el.style = '';
        });
    };

    function check(element, expectedElements) {
        testElementsFromPoint(element.getRootNode(), 50, 50, [...expectedElements, html]);
    }

    check(childDiv, [childDiv, child, parentDiv, parent, grandparentDiv, grandparent]);
    check(parentDiv, [child, parentDiv, parent, grandparentDiv, grandparent]);
    check(grandparentDiv, [parent, grandparentDiv, grandparent]);

    grandparent.style = 'width: 0px; height: 0px;';

    check(childDiv, [childDiv, child, parentDiv, parent, grandparentDiv]);
    check(parentDiv, [child, parentDiv, parent, grandparentDiv]);
    check(grandparentDiv, [parent, grandparentDiv]);

    resetStyles();
    parent.style = 'width: 0px; height: 0px;';

    check(childDiv, [childDiv, child, parentDiv, grandparentDiv, grandparent]);
    check(parentDiv, [child, parentDiv, grandparentDiv, grandparent]);
    check(grandparentDiv, [parent, grandparentDiv, grandparent]);

    resetStyles();
    child.style = 'width: 0px; height: 0px;';

    check(childDiv, [childDiv, parentDiv, parent, grandparentDiv, grandparent]);
    check(parentDiv, [child, parentDiv, parent, grandparentDiv, grandparent]);
    check(grandparentDiv, [parent, grandparentDiv, grandparent]);

    resetStyles();
    parent.style = 'width: 0px; height: 0px;';
    parentDiv.style = 'width: 0px; height: 0px;';

    check(childDiv, [childDiv, child, grandparentDiv, grandparent]);
    check(parentDiv, [child, grandparentDiv, grandparent]);
    check(grandparentDiv, [parent, grandparentDiv, grandparent]);

    resetStyles();
    parent.style = 'width: 0px; height: 0px;';
    parentDiv.style = 'width: 0px; height: 0px;';
    child.style = 'width: 0px; height: 0px;';

    check(childDiv, [childDiv, grandparentDiv, grandparent]);
    check(parentDiv, [child, grandparentDiv, grandparent]);
    check(grandparentDiv, [parent, grandparentDiv, grandparent]);

    resetStyles();
    parent.style = 'width: 0px; height: 0px;';
    child.style = 'width: 0px; height: 0px;';
    check(childDiv, [childDiv, parentDiv, grandparentDiv, grandparent]);
    check(parentDiv, [child, parentDiv, grandparentDiv, grandparent]);
    check(grandparentDiv, [parent, grandparentDiv, grandparent]);

    resetStyles();
    parent.style = 'width: 0px; height: 0px;';
    parentDiv.style = 'width: 0px; height: 0px;';
    child.style = 'width: 0px; height: 0px;';
    childDiv.style = 'width: 0px; height: 0px;';

    check(childDiv, [grandparentDiv, grandparent]);
    check(parentDiv, [grandparentDiv, grandparent]);
    check(grandparentDiv, [grandparentDiv, grandparent]);

    resetStyles();
    parentDiv.style = 'width: 0px; height: 0px;';
    child.style = 'width: 0px; height: 0px;';

    check(childDiv, [childDiv, parent, grandparentDiv, grandparent]);
    check(parentDiv, [child, parent, grandparentDiv, grandparent]);
    check(grandparentDiv, [parent, grandparentDiv, grandparent]);
});
