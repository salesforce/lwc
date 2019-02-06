/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactiveObserver, valueMutated, valueObserved } from '../index';

describe('reactive-service', () => {
    it('should observe object mutations via ReactiveObserver() instance during the observing phase', () => {
        let changed = false;
        const o = { x: 1 };
        // listening for mutation on object `o`
        const ro = new ReactiveObserver(() => {
            changed = true;
        });
        ro.observe(() => {
            valueObserved(o, 'x');
        });
        // mutating object `o`
        o.x = 2;
        valueMutated(o, 'x');
        expect(changed).toBe(true);
        // resetting the observer
        changed = false;
        ro.reset();
        // mutating object `o` again
        o.x = 3;
        valueMutated(o, 'x');
        expect(changed).toBe(false);
    });
    it('should support observing and mutating the same value multiple times', () => {
        let changed = 0;
        const o = { x: 1 };
        // listening for mutation on object `o`
        const ro = new ReactiveObserver(() => {
            changed++;
        });
        ro.observe(() => {
            valueObserved(o, 'x');
            valueObserved(o, 'x');
        });
        // mutating object `o`
        o.x = 2;
        valueMutated(o, 'x');
        expect(changed).toBe(1);
        o.x = 3;
        valueMutated(o, 'x');
        expect(changed).toBe(2);
    });
    it('should recover from a throw during the observing phase', () => {
        let changed = false;
        const o = { x: 1 };
        // listening for mutation on object `o`
        const ro = new ReactiveObserver(() => {
            changed = true;
        });
        try {
            ro.observe(() => {
                throw new Error('this should not break the observing phase flags');
            });
        } catch (ignore) {
            /* ignore this error */
        }
        // this observing should do nothing because the observing phase throws but the internal flagging is recovered
        valueObserved(o, 'x');
        // mutating object `o`
        o.x = 2;
        valueMutated(o, 'x');
        expect(changed).toBe(false); // it doesn't really observe the mutation
        // observing again but doing nothing just in case something it messed up
        ro.observe(() => {
            /* do nothing */
        });
        // mutating object `o`
        o.x = 3;
        valueMutated(o, 'x');
        expect(changed).toBe(false); // it doesn't really observe the mutation
    });
    it('should ignore object mutations signals when no value is observed', () => {
        let changed = false;
        const o = { x: 1 };
        // listening for mutation on object `o`
        const ro = new ReactiveObserver(() => {
            changed = true;
        });
        ro.reset();
        // mutating object `o`
        o.x = 2;
        valueMutated(o, 'x');
        expect(changed).toBe(false);
    });
    it('should ignore valueObserved calls that are not part of an observing phase', () => {
        let changed = false;
        const o = { x: 1 };
        // listening for mutation on object `o`
        const ro = new ReactiveObserver(() => {
            changed = true;
        });
        ro.reset();
        valueObserved(o, 'x');
        // mutating object `o`
        o.x = 2;
        valueMutated(o, 'x');
        expect(changed).toBe(false); // nothing was detected
    });
});
