import Component from 'x/component';
import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';
import ExportAsDefault from 'x/exportAsDefault';
import ExportAsDefaultWithOtherExports, { foo } from 'x/exportAsDefaultWithOtherExports';

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

    it('should work with `export { ... as default }` syntax', async () => {
        const elm = createElement('x-export-as-default', { is: ExportAsDefault });
        document.body.appendChild(elm);
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('h1').textContent).toBe('hello world');
    });

    it('should work with `export { ... as default }` syntax and other exports', async () => {
        expect(foo).toBe('foo');
        const elm = createElement('x-export-as-default-with-other-exports', {
            is: ExportAsDefaultWithOtherExports,
        });
        document.body.appendChild(elm);
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('h1').textContent).toBe('hello world');
    });
});
