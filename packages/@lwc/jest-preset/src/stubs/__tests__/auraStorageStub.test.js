/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// use import like consuming components will, and point to generated file in `dist` folder
// via jest config
// eslint-disable-next-line lwc/no-compat-module-storage
import storageService from 'aura-storage';

describe('auraStorageStub.js', () => {
    const storeName = 'myStore';
    let store = {};

    beforeEach(() => {
        store = storageService.initStorage({ name: storeName });
    });

    afterEach(() => {
        storageService.deleteStorage(storeName);
        store = undefined;
    });

    describe('initStorage()', () => {
        it('sets default values', () => {
            expect(store.getName()).toBe('myStore');
            expect(store.getSize()).toBe(0);
            expect(store.getMaxSize()).toBe(1000 * 1024);
        });
    });

    describe('getStorage()', () => {
        it('returns previously created storage', () => {
            expect(storageService.getStorage('myStore')).toBe(store);
        });

        it('returns undefined for non-existent storage', () => {
            expect(storageService.getStorage('nonExistent')).toBe(undefined);
        });
    });

    describe('getStorages()', () => {
        it('returns multiple previously created storage', () => {
            try {
                const store1 = storageService.initStorage({ name: 'myStore1' });
                const store2 = storageService.initStorage({ name: 'myStore2' });
                const storages = storageService.getStorages();
                expect(storages.myStore1).toBe(store1);
                expect(storages.myStore2).toBe(store2);
            } finally {
                storageService.deleteStorage('myStore1');
                storageService.deleteStorage('myStore2');
            }
        });
    });

    describe('AuraStorage stub', () => {
        it('sets, gets, removes entries', () => {
            return store
                .set('foo', 'bar')
                .then(() => {
                    return store.get('foo');
                })
                .then(val => {
                    expect(val).toBe('bar');
                    return store.remove('foo');
                })
                .then(() => {
                    return store.get('foo');
                })
                .then(val => {
                    expect(val).toBe(undefined);
                });
        });

        it('getAll gets all entries when param is falsey', () => {
            return store
                .set('foo', 'bar')
                .then(() => {
                    return store.set('foo2', 'bar2');
                })
                .then(() => {
                    return store.getAll();
                })
                .then(values => {
                    expect(Object.keys(values)).toHaveLength(2);
                    expect(values.foo).toBe('bar');
                    expect(values.foo2).toBe('bar2');
                });
        });

        it('setAll sets multiple values', () => {
            return store
                .setAll({ foo: 'bar', foo2: 'bar2' })
                .then(() => {
                    return store.getAll(['foo', 'foo2']);
                })
                .then(values => {
                    expect(Object.keys(values)).toHaveLength(2);
                    expect(values.foo).toBe('bar');
                    expect(values.foo2).toBe('bar2');
                });
        });
    });
});
