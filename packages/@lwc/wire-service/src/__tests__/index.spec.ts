/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { registerWireService, register } from '../index';

import { Element, ElementDef } from '../engine';

import { Context, ConfigContext } from '../wiring';
import { CONTEXT_ID, CONTEXT_CONNECTED, CONTEXT_DISCONNECTED, CONTEXT_UPDATED } from '../constants';

describe('wire service', () => {
    describe('registers the service with engine', () => {
        it('uses wiring hook', () => {
            const mockEngineRegister = jest.fn();
            registerWireService(mockEngineRegister);
            expect(mockEngineRegister).toHaveBeenCalledWith(
                expect.objectContaining({
                    wiring: expect.any(Function),
                })
            );
        });
        it('uses connected hook', () => {
            const mockEngineRegister = jest.fn();
            registerWireService(mockEngineRegister);
            expect(mockEngineRegister).toHaveBeenCalledWith(
                expect.objectContaining({
                    connected: expect.any(Function),
                })
            );
        });
        it('uses disconnected hook', () => {
            const mockEngineRegister = jest.fn();
            registerWireService(mockEngineRegister);
            expect(mockEngineRegister).toHaveBeenCalledWith(
                expect.objectContaining({
                    disconnected: expect.any(Function),
                })
            );
        });
    });
    describe('wiring process', () => {
        it('invokes adapter factory once per wire', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const adapterId = () => {
                /**/
            };
            const adapterFactory = jest.fn();
            register(adapterId, adapterFactory);
            const mockDef: ElementDef = {
                wire: {
                    targetFunction: {
                        adapter: adapterId,
                        method: 1,
                    },
                    targetProperty: {
                        adapter: adapterId,
                    },
                },
            };

            wireService.wiring({} as Element, {}, mockDef, {} as Context);
            expect(adapterFactory).toHaveBeenCalledTimes(2);
        });
        it('throws when adapter id is not truthy', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const mockDef: ElementDef = {
                wire: {
                    target: {
                        adapter: undefined,
                        method: 1,
                    },
                },
            };
            expect(() =>
                wireService.wiring({} as Element, {}, mockDef, {} as Context)
            ).toThrowError('@wire on "target": adapter id must be truthy');
        });
        it('throws when adapter factory is not found', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const mockDef: ElementDef = {
                wire: {
                    target: {
                        adapter: () => {
                            /**/
                        },
                        method: 1,
                    },
                },
            };
            expect(() =>
                wireService.wiring({} as Element, {}, mockDef, {} as Context)
            ).toThrowError('@wire on "target": unknown adapter id: ');
        });
        it('throws when dot-notation reactive parameter refers to non-@wire target', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const adapterId = () => {
                /**/
            };
            register(adapterId, adapterId);
            const mockDef: ElementDef = {
                wire: {
                    target: {
                        adapter: adapterId,
                        params: { p1: 'x.y' },
                    },
                },
            };
            expect(() =>
                wireService.wiring({} as Element, {}, mockDef, {} as Context)
            ).toThrowError(
                '@wire on "target": dot-notation reactive parameter "x.y" must refer to a @wire property'
            );
        });
        it('throws when dot-notation reactive parameter refers to @wired method', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const adapterId = () => {
                /**/
            };
            register(adapterId, adapterId);
            const mockDef: ElementDef = {
                wire: {
                    x: {
                        adapter: adapterId,
                        method: 1,
                    },
                    target: {
                        adapter: adapterId,
                        params: { p1: 'x.y' },
                    },
                },
            };
            expect(() =>
                wireService.wiring({} as Element, {}, mockDef, {} as Context)
            ).toThrowError(
                '@wire on "target": dot-notation reactive parameter "x.y" must refer to a @wire property'
            );
        });
        it('throws when reactive parameter refers to own wire target', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const adapterId = () => {
                /**/
            };
            register(adapterId, adapterId);
            const mockDef: ElementDef = {
                wire: {
                    target: {
                        adapter: adapterId,
                        params: { p1: 'target' },
                    },
                },
            };
            expect(() =>
                wireService.wiring({} as Element, {}, mockDef, {} as Context)
            ).toThrowError('@wire on "target": reactive parameter "target" must not refer to self');
        });
        it('throws when reactive parameter is empty', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const adapterId = () => {
                /**/
            };
            register(adapterId, adapterId);
            const mockDef: ElementDef = {
                wire: {
                    target: {
                        adapter: adapterId,
                        params: { p1: '' },
                    },
                },
            };
            expect(() =>
                wireService.wiring({} as Element, {}, mockDef, {} as Context)
            ).toThrowError('@wire on "target": reactive parameters must not be empty');
        });
        it('throws when reactive parameter contains empty segment', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const adapterId = () => {
                /**/
            };
            register(adapterId, adapterId);
            const mockDef: ElementDef = {
                wire: {
                    target: {
                        adapter: adapterId,
                        params: { p1: 'a..b' },
                    },
                },
            };
            expect(() =>
                wireService.wiring({} as Element, {}, mockDef, {} as Context)
            ).toThrowError('@wire on "target": reactive parameters must not be empty');
        });
        it('throws when reactive parameter ends with empty segment', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const adapterId = () => {
                /**/
            };
            register(adapterId, adapterId);
            const mockDef: ElementDef = {
                wire: {
                    target: {
                        adapter: adapterId,
                        params: { p1: 'a.b.' },
                    },
                },
            };
            expect(() =>
                wireService.wiring({} as Element, {}, mockDef, {} as Context)
            ).toThrowError('@wire on "target": reactive parameters must not be empty');
        });
    });
    describe('connected handling', () => {
        const def: ElementDef = {
            wire: {
                target: { adapter: true },
            },
        };
        it('invokes connected listeners', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const listener = jest.fn();
            const context: Context = {
                [CONTEXT_ID]: {
                    [CONTEXT_CONNECTED]: [listener],
                    [CONTEXT_DISCONNECTED]: [],
                    [CONTEXT_UPDATED]: {} as ConfigContext,
                },
            };

            wireService.connected({} as Element, {}, def, context);
            expect(listener).toHaveBeenCalledTimes(1);
        });
    });
    describe('disconnected handling', () => {
        const def: ElementDef = {
            wire: {
                target: { adapter: true },
            },
        };
        it('invokes connected listeners', () => {
            let wireService;
            registerWireService(svc => {
                wireService = svc;
            });
            const listener = jest.fn();
            const context: Context = {
                [CONTEXT_ID]: {
                    [CONTEXT_CONNECTED]: [],
                    [CONTEXT_DISCONNECTED]: [listener],
                    [CONTEXT_UPDATED]: {} as ConfigContext,
                },
            };

            wireService.disconnected({} as Element, {}, def, context);
            expect(listener).toHaveBeenCalledTimes(1);
        });
    });
});

describe('register', () => {
    // most common ids are functions and symbols so explicitly test those
    it('accepts function as adapter id', () => {
        function adapterId() {}
        function adapterFactory() {}
        register(adapterId, adapterFactory);
    });
    it('accepts symbol as adapter id', () => {
        const adapterId = Symbol();
        function adapterFactory() {}
        register(adapterId, adapterFactory);
    });
    it('throws when adapter id is not truthy', () => {
        function adapterFactory() {}
        expect(() => register(undefined, adapterFactory)).toThrowError('adapter id must be truthy');
    });
    it('throws when adapter factory is not a function', () => {
        expect(() => register({}, {} as any)).toThrowError('adapter factory must be a callable');
    });
});
