import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';

import Test from 'x/test';

describe('Node.isConnected', () => {
    it('should return false if the component is disconnected', () => {
        const elm = createElement('x-test', { is: Test });
        expect(elm.shadowRoot.isConnected).toBe(false);
    });

    it('should return false if the component is in a DocumentFragment until its connected to the document', () => {
        const elm = createElement('x-test', { is: Test });
        const frag = document.createDocumentFragment();
        const doAppend = () => frag.appendChild(elm);

        if (nativeCustomElementLifecycleEnabled) {
            doAppend();
        } else {
            // Expected warning, since we are working with disconnected nodes
            expect(doAppend).toLogWarningDev(
                /fired a `connectedCallback` and rendered, but was not connected to the DOM/
            );
        }

        expect(elm.shadowRoot.isConnected).toBe(false);

        document.body.appendChild(frag);
        expect(elm.shadowRoot.isConnected).toBe(true);
    });

    it('should return true if the component is connected in the DOM', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.isConnected).toBe(true);
        expect(elm.shadowRoot.querySelector('div').isConnected).toBe(true);
    });
});
