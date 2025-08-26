import { createElement } from 'lwc';

import CascadeWiredProps from 'x/cascadeWiredProps';

describe('@wire reactive parameters', () => {
    it('should provide complete configuration to dependent adapter', async () => {
        const elm = createElement('x-cascade-wire', { is: CascadeWiredProps });
        document.body.appendChild(elm);

        const secondWireValue = await new Promise((resolve) => {
            elm.addEventListener('dependantwirevalue', (evt) => {
                resolve(evt.detail.providedValue);
            });
        });

        expect(secondWireValue.firstParam).toBe('first-param-value');
        expect(secondWireValue.secondParam).toBe('second-param-value');
    });
});
