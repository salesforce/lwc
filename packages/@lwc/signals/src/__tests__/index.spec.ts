/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { Signal } from './signal';

describe('signal protocol', () => {
    it('should be able to retrieve value', () => {
        const s = new Signal(1);
        expect(s.value).toBe(1);
    });

    it('should be able to subscribe to signal', () => {
        const s = new Signal();
        expect('subscribe' in s).toBe(true);
        expect(typeof s.subscribe).toBe('function');
        const onUpdate = jest.fn();
        expect(() => s.subscribe(onUpdate)).not.toThrow();
    });

    it('should be able to notify subscribers', () => {
        const s = new Signal();
        const onUpdate = jest.fn();
        s.subscribe(onUpdate);
        s.value = 1;
        expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('subscribe should return an unsubscribe function', () => {
        const s = new Signal();
        const onUpdate = jest.fn();
        const unsubscribe = s.subscribe(onUpdate);
        expect(typeof unsubscribe).toBe('function');
    });

    it('should not notify once unsubscribed', () => {
        const s = new Signal(0);
        const onUpdate1 = jest.fn();
        const onUpdate2 = jest.fn();
        const unsubscribe1 = s.subscribe(onUpdate1);
        const unsubscribe2 = s.subscribe(onUpdate2);

        s.value = 1;
        expect(onUpdate1).toHaveBeenCalledTimes(1);
        expect(onUpdate2).toHaveBeenCalledTimes(1);

        unsubscribe1();

        s.value = 2;
        expect(onUpdate1).toHaveBeenCalledTimes(1);
        expect(onUpdate2).toHaveBeenCalledTimes(2);

        unsubscribe2();

        s.value = 3;
        expect(onUpdate1).toHaveBeenCalledTimes(1);
        expect(onUpdate2).toHaveBeenCalledTimes(2);
    });

    it('SignalBaseClass does not subscribe duplicate OnUpdate callback functions', () => {
        const s = new Signal(0);
        const onUpdate = jest.fn();
        s.subscribe(onUpdate);
        s.subscribe(onUpdate);

        s.value = 1;
        expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    it('should be able to reference other signals in subscription', () => {
        const s1 = new Signal(0);
        const s2 = new Signal(1);
        const s3 = new Signal(1);

        s2.subscribe(() => (s1.value = s2.value + s3.value));
        s3.subscribe(() => (s1.value = s2.value + s3.value));

        s2.value = 2;
        expect(s1.value).toBe(3);

        s3.value = 3;
        expect(s1.value).toBe(5);
    });
});
