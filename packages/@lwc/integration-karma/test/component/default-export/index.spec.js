import Component from 'x/component';
import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

describe('default export', () => {
    it('should work when a module exports non-components as default', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
        const nodes = extractDataIds(elm);

        expect(nodes.undef.textContent).toEqual('undefined');
        expect(nodes.nil.textContent).toEqual('null');
        expect(nodes.zero.textContent).toEqual('0');
        expect(nodes.string.textContent).toEqual('"bar"');
    });
});
