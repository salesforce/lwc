import { createElement } from 'lwc';
import LightParent from 'c/lightParent';
import { extractDataIds } from '../../../helpers/utils.js';

describe('light parent with shadow child', () => {
    it('should render properly', () => {
        const element = createElement('c-light-parent', { is: LightParent });
        element.setAttribute('data-id', 'c-light-parent');
        document.body.appendChild(element);

        const nodes = extractDataIds(element);
        expect(Object.keys(nodes)).toEqual([
            'c-light-parent',
            'parent-text',
            'c-shadow-child',
            'c-shadow-child.shadowRoot',
            'child-text',
        ]);

        expect(element.shadowRoot).toBeNull();
        expect(nodes['parent-text'].innerText).toEqual('inside parent');
        expect(nodes['c-shadow-child'].shadowRoot).not.toBeNull();
        expect(nodes['child-text'].innerText).toEqual('inside child');
    });
});
