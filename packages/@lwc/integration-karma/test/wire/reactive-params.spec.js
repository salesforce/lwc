import { createElement } from 'lwc';

import CascadeWiredProps from 'x/cascadeWiredProps';

describe('@wire reactive parameters', () => {
    it('should provide complete configuration to dependent adapter', () => {
        return new Promise((resolve) => {
            const elm = createElement('x-cascade-wire', { is: CascadeWiredProps });

            elm.addEventListener('dependantwirevalue', (evt) => {
                const secondWireValue = evt.detail.providedValue;

                expect(secondWireValue.firstParam).toBe('first-param-value');
                expect(secondWireValue.secondParam).toBe('second-param-value');
                resolve();
            });

            document.body.appendChild(elm);
        });
    });
});
