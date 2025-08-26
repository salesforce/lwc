import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';

describe('shadow parent with light child', () => {
    it('should render properly', () => {
        const element = createElement('x-container', { is: Container });
        element.setAttribute('data-id', 'x-container');
        document.body.appendChild(element);
        const nodes = extractDataIds(element);
        expect(Object.keys(nodes)).toEqual([
            'x-container',
            'x-container.shadowRoot',
            'container-text',
            'x-test',
            'test-text',
        ]);

        expect(element.shadowRoot).not.toBeNull();
        expect(nodes['container-text'].innerText).toEqual('Hello, Shadow DOM');
        expect(nodes['x-test'].shadowRoot).toBeNull();
        expect(nodes['test-text'].innerText).toEqual('Hello, Light DOM');
    });
});
