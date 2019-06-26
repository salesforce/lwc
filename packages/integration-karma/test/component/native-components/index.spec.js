import { createElement } from 'lwc';

import Parent from 'x/parent';
import Child from 'x/child';

if (process.env.NATIVE_SHADOW) {
    it('native components should be useable from within LWC templates', () => {
        const elem = createElement('x-parent', { is: Parent });
        document.body.appendChild(elem);
        const childElm = elem.shadowRoot.querySelector('x-child');
        expect(childElm.shadowRoot instanceof ShadowRoot).toBe(true);
        expect(childElm instanceof Child).toBe(true);
    });
}
