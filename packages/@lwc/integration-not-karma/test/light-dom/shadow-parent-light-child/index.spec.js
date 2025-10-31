import { createElement } from 'lwc';
import Container from 'c/container';
import { extractDataIds } from '../../../helpers/utils.js';

describe('shadow parent with light child', () => {
    it('should render properly', () => {
        const element = createElement('c-container', { is: Container });
        element.setAttribute('data-id', 'c-container');
        document.body.appendChild(element);
        const nodes = extractDataIds(element);
        expect(Object.keys(nodes)).toEqual([
            'c-container',
            'c-container.shadowRoot',
            'container-text',
            'c-test',
            'test-text',
        ]);

        expect(element.shadowRoot).not.toBeNull();
        expect(nodes['container-text'].innerText).toEqual('Hello, Shadow DOM');
        expect(nodes['c-test'].shadowRoot).toBeNull();
        expect(nodes['test-text'].innerText).toEqual('Hello, Light DOM');
    });
});
