import { createElement } from 'test-utils';

import Slotted from 'x/slotted';

// #986 - childNodes on the host element returns a fake shadow comment node on IE11 for debugging purposed. This method
// filters this node.
function getHostChildNodes(host) {
    return [...host.childNodes].filter(n => {
        return n.nodeType !== Node.COMMENT_NODE && !n.tagName.startsWith('#shadow-root');
    });
}

describe('Node.childNodes', () => {
    it('should return the right children Nodes - x-slotted', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const hostChildNodes = getHostChildNodes(elm);
        expect(hostChildNodes.length).toBe(0);

        expect(elm.shadowRoot.childNodes.length).toBe(1);
        expect(elm.shadowRoot.childNodes[0]).toBe(elm.shadowRoot.querySelector('.outer'));

        expect(elm.shadowRoot.querySelector('.slotted').childNodes.length).toBe(1);
        expect(elm.shadowRoot.querySelector('.slotted').childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(elm.shadowRoot.querySelector('.slotted').childNodes[0].textContent).toBe('Slotted Text');
    });

    it('should return the right children Nodes - x-container', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const container = elm.shadowRoot.querySelector('x-container');

        const hostChildNodes = getHostChildNodes(container);
        expect(hostChildNodes.length).toBe(1);
        expect(hostChildNodes[0]).toBe(elm.shadowRoot.querySelector('.slotted'));

        expect(container.shadowRoot.childNodes.length).toBe(3);
        expect(container.shadowRoot.childNodes[1]).toBe(container.shadowRoot.querySelector('.container'));

        // With native shadow the fallback slot content is rendered regardless if the slot has assigned nodes or not.
        // While with synthetic shadow, the fallback slot content is only rendered only when the slot has no assigned
        // nodes.
        expect(container.shadowRoot.querySelector('slot').childNodes.length).toBe(process.env.NATIVE_SHADOW ? 1 : 0);
    });
});
