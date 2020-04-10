import { createElement } from 'lwc';

import CascadeWiredProps from 'x/cascadeWiredProps';
import SimpleWiredProps from 'x/simpleWiredComponent';

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

    // in the current wire service, this fails, because it does not calls the config.
    // in the wire reform, it does call the config, with undefined in the parameters.
    it('should not trigger config with undefined params', done => {
        const elm = createElement('x-simple-wire', { is: SimpleWiredProps });

        elm.addEventListener('dependantwirevalue', evt => {
            const secondWireValue = evt.detail.providedValue;

            expect(secondWireValue.firstParam).toBe('undefined');
            done();
        });

        // elm.setSimpleWireConfig('jose');
        document.body.appendChild(elm);
    });
});
