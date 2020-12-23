import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

function createShadowTree(parentNode) {
    const elm = createElement('x-container', { is: Container });
    elm.setAttribute('data-id', 'x-container');
    parentNode.appendChild(elm);
    return extractDataIds(elm);
}

describe('EventTarget.dispatchEvent', () => {
    let nodes;
    beforeEach(() => {
        nodes = createShadowTree(document.body);
    });

    it('should return true when none of the event handlers cancel', () => {
        nodes.button.addEventListener('custom-event', () => {});
        const result = nodes.button.dispatchEvent(new Event('custom-event'));

        expect(result).toBeTrue();
    });

    it('should return false when an event handler cancels', () => {
        nodes.button.addEventListener('custom-event', (e) => {
            e.preventDefault();
        });
        const result = nodes.button.dispatchEvent(new Event('custom-event', { cancelable: true }));

        expect(result).toBeFalse();
    });
});
