import { createElement } from 'test-utils';

import NoDirectChild from 'x/noDirectChild';
import Basic from 'x/basic';
import SlotsInSlots from 'x/slotsInSlots';
import Complex from 'x/complex';

// Chrome is the only browser implementing HTMLSlotElement.assignedElement natively.
// Webkit - https://bugs.webkit.org/show_bug.cgi?id=180908
// Gecko - https://bugzilla.mozilla.org/show_bug.cgi?id=1425685
const SUPPORT_ASSIGNED_ELEMENTS = !process.env.NATIVE_SHADOW || 'assignedElements' in document.createElement('slot');

function extractDataIds(root) {
    const nodes = {};

    function processElement(elm) {
        if (elm.hasAttribute('data-id')) {
            nodes[elm.getAttribute('data-id')] = elm;
        }

        if (elm.shadowRoot) {
            Object.assign(nodes, extractShadowDataIds(elm.shadowRoot));
        }
    }

    function acceptNode() {
        return NodeFilter.FILTER_ACCEPT;
    }

    // Work around Internet Explorer wanting a function instead of an object. IE also *requires* this argument where
    // other browsers don't.
    const safeFilter = acceptNode;
    safeFilter.acceptNode = acceptNode;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, safeFilter, false);

    processElement(root);

    let elm;
    while ((elm = walker.nextNode())) {
        processElement(elm);
    }

    return nodes;
}

function extractShadowDataIds(shadowRoot) {
    const nodes = {};

    // We can't use a TreeWalker directly on the ShadowRoot since with synthetic shadow the ShadowRoot is not an
    // actual DOM nodes. So we need to iterate over the children manually and run the tree walker on each child.
    for (const child of shadowRoot.childNodes) {
        Object.assign(nodes, extractDataIds(child));
    }

    return nodes;
}

describe('ignore non direct host children', () => {
    let elm;
    let nodes;

    beforeAll(() => {
        elm = createElement('x-no-direct-child', { is: NoDirectChild });
        document.body.appendChild(elm);

        nodes = extractShadowDataIds(elm.shadowRoot);
    });

    it('assignedNodes', () => {
        expect(nodes.default1.assignedNodes()).toEqual([nodes.slotted3]);
        expect(nodes.slot1.assignedNodes()).toEqual([nodes.slotted1, nodes.slotted2]);

        expect(nodes.default1.assignedNodes({ flatten: true })).toEqual([nodes.slotted3]);
        expect(nodes.slot1.assignedNodes({ flatten: true })).toEqual([nodes.slotted1, nodes.slotted2]);
    });

    if (SUPPORT_ASSIGNED_ELEMENTS) {
        it('assignedElements', () => {
            expect(nodes.default1.assignedElements()).toEqual([nodes.slotted3]);
            expect(nodes.slot1.assignedElements()).toEqual([nodes.slotted1, nodes.slotted2]);

            expect(nodes.default1.assignedElements({ flatten: true })).toEqual([nodes.slotted3]);
            expect(nodes.slot1.assignedElements({ flatten: true })).toEqual([nodes.slotted1, nodes.slotted2]);
        });
    }
});

describe('fallback content basic', () => {
    let elm;
    let nodes;

    beforeAll(() => {
        elm = createElement('x-basic', { is: Basic });
        document.body.appendChild(elm);

        nodes = extractShadowDataIds(elm.shadowRoot);
    });

    it('assignedNodes', () => {
        expect(nodes.default1.assignedNodes()).toEqual([]);
        expect(nodes.slot1.assignedNodes()).toEqual([]);

        expect(nodes.default1.assignedNodes({ flatten: true })).toEqual([
            nodes.default1.firstChild,
            nodes.fallback1,
            nodes.default1.lastChild,
        ]);
        expect(nodes.slot1.assignedNodes({ flatten: true })).toEqual([]);
    });

    if (SUPPORT_ASSIGNED_ELEMENTS) {
        it('assignedElements', () => {
            expect(nodes.default1.assignedElements()).toEqual([]);
            expect(nodes.slot1.assignedElements()).toEqual([]);

            expect(nodes.default1.assignedElements({ flatten: true })).toEqual([nodes.fallback1]);
            expect(nodes.slot1.assignedElements({ flatten: true })).toEqual([]);
        });
    }
});

describe('fallback content slots in slots', () => {
    let elm;
    let nodes;

    beforeAll(() => {
        elm = createElement('x-slots-in-slots', { is: SlotsInSlots });
        document.body.appendChild(elm);

        nodes = extractShadowDataIds(elm.shadowRoot);
    });

    it('assignedNodes', () => {
        expect(nodes.slot1.assignedNodes()).toEqual([]);
        expect(nodes.slot2.assignedNodes()).toEqual([]);

        expect(nodes.slot1.assignedNodes({ flatten: true })).toEqual([nodes.fallback1]);
        expect(nodes.slot2.assignedNodes({ flatten: true })).toEqual([nodes.fallback1]);
    });

    if (SUPPORT_ASSIGNED_ELEMENTS) {
        it('assignedElements', () => {
            expect(nodes.slot1.assignedElements()).toEqual([]);
            expect(nodes.slot2.assignedElements()).toEqual([]);

            expect(nodes.slot1.assignedElements({ flatten: true })).toEqual([nodes.fallback1]);
            expect(nodes.slot2.assignedElements({ flatten: true })).toEqual([nodes.fallback1]);
        });
    }
});

describe('fallback content complex', () => {
    let elm;
    let nodes;

    beforeAll(() => {
        elm = createElement('x-complex', { is: Complex });
        document.body.appendChild(elm);

        nodes = extractShadowDataIds(elm.shadowRoot);
    });

    it('assignedNodes', () => {
        expect(nodes.slot1.assignedNodes()).toEqual([nodes.slotted1]);
        expect(nodes.slot2.assignedNodes()).toEqual([]);
        expect(nodes.slot3.assignedNodes()).toEqual([nodes.slot2]);
        expect(nodes.slot4.assignedNodes()).toEqual([]);

        expect(nodes.slot1.assignedNodes({ flatten: true })).toEqual([nodes.slotted1]);
        expect(nodes.slot2.assignedNodes({ flatten: true })).toEqual([nodes.slotted1, nodes.fallback2]);
        expect(nodes.slot3.assignedNodes({ flatten: true })).toEqual([nodes.slotted1, nodes.fallback2]);
        expect(nodes.slot4.assignedNodes({ flatten: true })).toEqual([
            nodes.slotted1,
            nodes.fallback2,
            nodes.fallback3,
        ]);
    });

    if (SUPPORT_ASSIGNED_ELEMENTS) {
        it('assignedElements', () => {
            expect(nodes.slot1.assignedElements()).toEqual([nodes.slotted1]);
            expect(nodes.slot2.assignedElements()).toEqual([]);
            expect(nodes.slot3.assignedElements()).toEqual([nodes.slot2]);
            expect(nodes.slot4.assignedElements()).toEqual([]);

            expect(nodes.slot1.assignedElements({ flatten: true })).toEqual([nodes.slotted1]);
            expect(nodes.slot2.assignedElements({ flatten: true })).toEqual([nodes.slotted1, nodes.fallback2]);
            expect(nodes.slot3.assignedElements({ flatten: true })).toEqual([nodes.slotted1, nodes.fallback2]);
            expect(nodes.slot4.assignedElements({ flatten: true })).toEqual([
                nodes.slotted1,
                nodes.fallback2,
                nodes.fallback3,
            ]);
        });
    }
});
