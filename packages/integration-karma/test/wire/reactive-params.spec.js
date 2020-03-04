import { createElement } from 'lwc';

import CascadeWiredProps from 'x/cascadeWiredProps';

describe('@wire reactive parameters', () => {
    if (process.env.COMPAT !== true) {
        // this functionality does not works in compat due the fact that the wire-service can't extract
        // the values of an ie11 proxy object.
        it('should provide complete configuration to dependent adapter', done => {
            const elm = createElement('x-cascade-wire', { is: CascadeWiredProps });
            elm.addEventListener('dependantwirevalue', evt => {
                const secondWireValue = evt.detail.providedValue;

                expect(secondWireValue.firstParam).toBe('first-param-value');
                expect(secondWireValue.secondParam).toBe('second-param-value');
                done();
            });

            document.body.appendChild(elm);
        });
    }
});
