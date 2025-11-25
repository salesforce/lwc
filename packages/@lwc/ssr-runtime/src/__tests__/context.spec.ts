import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as shared from '@lwc/shared';
import { connectContext, ContextBinding } from '../context';
import { LightningElement, SYMBOL__CONTEXT_VARIETIES } from '../lightning-element';
import { getContextfulStack } from '../wire';
import type { Signal } from '@lwc/signals';
import type { ContextProvidedCallback } from '@lwc/shared';

// Mock the wire module
vi.mock('../wire', () => ({
    getContextfulStack: vi.fn(),
}));

// Mock @lwc/shared
vi.mock('@lwc/shared', () => ({
    isTrustedContext: vi.fn(),
    getContextKeys: vi.fn(),
    isUndefined: vi.fn(),
    keys: vi.fn(),
    entries: vi.fn().mockReturnValue([]),
    AriaAttrNameToPropNameMap: {},
    defineProperties: vi.fn(),
    assign: vi.fn(),
    ArrayFilter: {
        call: vi.fn(),
    },
}));

describe.skip('context', () => {
    let mockContextKeys: { connectContext: string };
    let mockContextfulStack: LightningElement[];
    let mockContextVariety: object;
    let mockContextSignal: Signal<unknown>;
    let mockContextProvidedCallback: ContextProvidedCallback;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Setup mock context keys
        mockContextKeys = {
            connectContext: 'connectContext',
        };

        // Setup mock contextful stack
        mockContextfulStack = [new LightningElement({ tagName: 'div' })];
        (getContextfulStack as any).mockReturnValue(mockContextfulStack);

        // Setup mock context variety and signal
        mockContextVariety = {};
        mockContextSignal = { value: undefined } as Signal<unknown>;
        mockContextProvidedCallback = vi.fn();

        // Mock global context keys
        (global as any).__LWC_CONTEXT_KEYS__ = mockContextKeys;

        // Mock @lwc/shared functions
        (shared.getContextKeys as any).mockReturnValue(mockContextKeys);
        (shared.isUndefined as any).mockImplementation((val: unknown) => val === undefined);
        (shared.keys as any).mockReturnValue(['contextful']);
        (shared.isTrustedContext as any).mockReturnValue(true);
        (shared.ArrayFilter.call as any).mockReturnValue(['contextful']);
    });

    describe('connectContext', () => {
        it('should do nothing if context keys are undefined', () => {
            (shared.getContextKeys as any).mockReturnValue(undefined);
            const component = new LightningElement({ tagName: 'div' });
            connectContext(component);
            expect(getContextfulStack).not.toHaveBeenCalled();
        });

        it('should do nothing if no contextful keys are found', () => {
            (shared.ArrayFilter.call as any).mockReturnValue([]);
            const component = new LightningElement({ tagName: 'div' });
            connectContext(component);
            expect(getContextfulStack).not.toHaveBeenCalled();
        });

        it('should connect context when contextful keys are found', () => {
            const component = new LightningElement({ tagName: 'div' });
            const mockContextful = {
                [mockContextKeys.connectContext]: vi.fn(),
            };
            Object.defineProperty(component, 'contextful', {
                value: mockContextful,
                configurable: true,
            });

            connectContext(component);

            expect(mockContextful[mockContextKeys.connectContext]).toHaveBeenCalled();
        });

        it('should throw error in development when connecting context fails', () => {
            const originalNodeEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const component = new LightningElement({ tagName: 'div' });
            const mockContextful = {
                [mockContextKeys.connectContext]: vi.fn().mockImplementation(() => {
                    throw new Error('Connection failed');
                }),
            };
            Object.defineProperty(component, 'contextful', {
                value: mockContextful,
                configurable: true,
            });

            expect(() => connectContext(component)).toThrow(
                'Attempted to connect to trusted context'
            );

            process.env.NODE_ENV = originalNodeEnv;
        });
    });

    describe('ContextBinding', () => {
        it('should provide context successfully', () => {
            const component = new LightningElement({ tagName: 'div' });
            const binding = new ContextBinding(component);

            binding.provideContext(mockContextVariety, mockContextSignal);

            expect(component[SYMBOL__CONTEXT_VARIETIES].has(mockContextVariety)).toBe(true);
            expect(component[SYMBOL__CONTEXT_VARIETIES].get(mockContextVariety)).toBe(
                mockContextSignal
            );
        });

        it('should not allow multiple contexts of the same variety in development', () => {
            const originalNodeEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const component = new LightningElement({ tagName: 'div' });
            const binding = new ContextBinding(component);

            binding.provideContext(mockContextVariety, mockContextSignal);
            expect(() => {
                binding.provideContext(mockContextVariety, mockContextSignal);
            }).toThrow('Multiple contexts of the same variety were provided');

            process.env.NODE_ENV = originalNodeEnv;
        });

        it('should consume context from ancestor', () => {
            const component = new LightningElement({ tagName: 'div' });
            const binding = new ContextBinding(component);

            // Setup ancestor with context
            const ancestor = mockContextfulStack[0];
            ancestor[SYMBOL__CONTEXT_VARIETIES] = new Map([
                [mockContextVariety, mockContextSignal],
            ]);

            binding.consumeContext(mockContextVariety, mockContextProvidedCallback);

            expect(mockContextProvidedCallback).toHaveBeenCalledExactlyOnceWith(mockContextSignal);
        });

        it('should not call callback if context is not found in ancestors', () => {
            const component = new LightningElement({ tagName: 'div' });
            const binding = new ContextBinding(component);

            // Setup empty ancestor
            const ancestor = mockContextfulStack[0];
            ancestor[SYMBOL__CONTEXT_VARIETIES] = new Map();

            binding.consumeContext(mockContextVariety, mockContextProvidedCallback);

            expect(mockContextProvidedCallback).not.toHaveBeenCalled();
        });
    });
});
