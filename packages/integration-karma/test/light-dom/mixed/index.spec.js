import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import Container from 'x/container';
function createComponent() {
    const element = createElement('x-container', { is: Container });
    element.setAttribute('data-id', 'x-container');
    document.body.appendChild(element);
    return extractDataIds(element);
}
describe('Light DOM mixed', () => {
    it('should render properly', () => {
        const nodes = createComponent();
        expect(Object.keys(nodes)).toEqual([
            'x-container',
            'x-container.shadowRoot',
            'x-test',
            'text',
        ]);
    });
});
