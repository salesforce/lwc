import {
    installTrap
} from '../property-trap';
import { ConfigContext } from '../wiring';

describe('findDescriptor', () => {
    it('detects circular prototype chains', () => {
    });
    it('finds descriptor on super', () => {
    });
});

describe('installTrap', () => {
    it('defaults to original value when setter installed', () => {
        class Target {
            prop1 = 'initial';
        }
        const cmp = new Target();
        installTrap(cmp, 'prop1', {} as ConfigContext);
        expect(cmp.prop1).toBe('initial');
    });
    it('updates original property when installed setter invoked', () => {
        const expected = 'expected';
        class Target {
            prop1;
        }
        const cmp = new Target();
        installTrap(cmp, 'prop1', {} as ConfigContext);
        cmp.prop1 = expected;
        expect(cmp.prop1).toBe(expected);
    });
    it('installs setter on cmp for property', () => {
        class Target {
            set prop1(value) { /* empty */ }
        }
        const original = Object.getOwnPropertyDescriptor(Target.prototype, 'prop1');
        const cmp = new Target();
        installTrap(cmp, 'prop1', {} as ConfigContext);
        const descriptor = Object.getOwnPropertyDescriptor(cmp, 'prop1');
        if (descriptor && original) {
            expect(descriptor.set).not.toBe(original.set);
        }
    });
    it('invokes original setter when installed setter invoked', () => {
        const setter = jest.fn();
        const expected = 'expected';
        class Target {
            set prop1(value) {
                setter(value);
            }
            get prop1() { return ''; }
        }
        const cmp = new Target();
        installTrap(cmp, 'prop1', {} as ConfigContext);
        cmp.prop1 = expected;
        expect(setter).toHaveBeenCalledTimes(1);
        expect(setter).toHaveBeenCalledWith(expected);
    });
});
