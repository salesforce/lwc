import { createElement } from 'lwc';

import CascadeWiredProps from 'x/cascadeWiredProps';
import SimpleWiredProps from 'x/simpleWiredProps';

describe('@wire reactive parameters', () => {
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

    it('should not call update when all params are undefined params', done => {
        const elm = createElement('x-simple-wire', { is: SimpleWiredProps });
        let wireConfigCalled = false;

        elm.addEventListener('adapterupdate', () => {
            wireConfigCalled = true;
        });

        // elm.setSimpleWireConfig('jose');
        document.body.appendChild(elm);

        setTimeout(() => {
            expect(wireConfigCalled).toBe(false);
            done();
        }, 1);
    });

    it('should call update when at least one of initial undefined params change', done => {
        const elm = createElement('x-simple-wire', { is: SimpleWiredProps });
        let wireConfigCalled = false;

        elm.addEventListener('adapterupdate', () => {
            wireConfigCalled = true;
        });

        document.body.appendChild(elm);

        setTimeout(() => {
            expect(wireConfigCalled).toBe(false);
            elm.setSimpleWireConfig('test-value');

            setTimeout(() => {
                expect(wireConfigCalled).toBe(true);
                done();
            }, 1);
        }, 1);
    });
});
