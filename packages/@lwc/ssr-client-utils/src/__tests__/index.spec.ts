/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock CSS API for testing
const mockCSSStyleSheet = vi.fn();
global.CSSStyleSheet = mockCSSStyleSheet;

// Mock customElements API
const mockDefine = vi.fn();
global.customElements = {
    define: mockDefine,
} as any;

// Mock document.createElement
global.document = {
    createElement: vi.fn(),
} as any;

describe('registerLwcStyleComponent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should register lwc-style custom element', async () => {
        const { registerLwcStyleComponent } = await import('../index');
        registerLwcStyleComponent();
        expect(mockDefine).toHaveBeenCalledWith('lwc-style', expect.any(Function));
    });
});

describe('StyleDeduplicator (lwc-style element)', () => {
    let StyleDeduplicatorClass: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockDefine.mockClear();
        mockCSSStyleSheet.mockClear();

        // Clear modules to get fresh import
        vi.resetModules();

        // Set up test environment for cache clearing
        const originalProcess = (global as any).process;
        (global as any).process = { env: { NODE_ENV: 'test-karma-lwc' } };
        (global as any).window = {};

        // Import fresh module
        const { registerLwcStyleComponent } = await import('../index');
        registerLwcStyleComponent();

        // Get the StyleDeduplicator class
        StyleDeduplicatorClass = mockDefine.mock.calls[0][1];

        // Clear the cache
        if ((global as any).window?.__lwcClearStylesheetCache) {
            (global as any).window.__lwcClearStylesheetCache();
        }

        // Restore process
        (global as any).process = originalProcess;
    });

    describe('connectedCallback', () => {
        it('should throw error when style-id attribute is missing', () => {
            const mockElement = {
                getAttribute: vi.fn().mockReturnValue(null),
            };

            expect(() => {
                StyleDeduplicatorClass.prototype.connectedCallback.call(mockElement);
            }).toThrow('"style-id" attribute must be supplied for <lwc-style> element');
        });

        it('should throw error when style-id attribute is empty string', () => {
            const mockElement = {
                getAttribute: vi.fn().mockReturnValue(''),
            };

            expect(() => {
                StyleDeduplicatorClass.prototype.connectedCallback.call(mockElement);
            }).toThrow('"style-id" attribute must be supplied for <lwc-style> element');
        });

        it('should throw error when referenced style element does not exist', () => {
            const mockElement = {
                getAttribute: vi.fn().mockReturnValue('test-style-id'),
                getRootNode: vi.fn().mockReturnValue({
                    getElementById: vi.fn().mockReturnValue(null),
                }),
            };

            expect(() => {
                StyleDeduplicatorClass.prototype.connectedCallback.call(mockElement);
            }).toThrow(
                '<lwc-style> tag found with no corresponding <style id="test-style-id"> tag'
            );
        });

        it('should create new stylesheet and remove element on first encounter', () => {
            const mockStylesheet = { replaceSync: vi.fn() };
            mockCSSStyleSheet.mockReturnValue(mockStylesheet);

            const mockElement = {
                getAttribute: vi.fn().mockReturnValue('test-style-id'),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue({ innerHTML: 'body { color: red; }' }),
                }),
                remove: vi.fn(),
            };

            StyleDeduplicatorClass.prototype.connectedCallback.call(mockElement);

            expect(mockCSSStyleSheet).toHaveBeenCalled();
            expect(mockStylesheet.replaceSync).toHaveBeenCalledWith('body { color: red; }');
            expect(mockElement.remove).toHaveBeenCalled();
        });

        it('should reuse cached stylesheet and create placeholder on subsequent encounters', () => {
            const mockStylesheet = { replaceSync: vi.fn() };
            mockCSSStyleSheet.mockReturnValue(mockStylesheet);
            const mockPlaceholder = {
                setAttribute: vi.fn(),
                classList: { add: vi.fn() },
            };
            (document.createElement as any).mockReturnValue(mockPlaceholder);

            const styleId = 'test-style-id';
            const mockStyleElement = { innerHTML: 'body { color: red; }' };

            // First element - creates cache
            const firstElement = {
                getAttribute: vi.fn().mockReturnValue(styleId),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue(mockStyleElement),
                }),
                remove: vi.fn(),
            };
            StyleDeduplicatorClass.prototype.connectedCallback.call(firstElement);

            // Second element - reuses cache
            const secondElement = {
                getAttribute: vi.fn().mockReturnValue(styleId),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue(mockStyleElement),
                }),
                classList: {
                    forEach: vi.fn((callback) => {
                        callback('scope-class-1');
                        callback('scope-class-2');
                    }),
                },
                replaceWith: vi.fn(),
                remove: vi.fn(),
            };

            StyleDeduplicatorClass.prototype.connectedCallback.call(secondElement);

            // Verify behavior
            expect(document.createElement).toHaveBeenCalledWith('style');
            expect(mockPlaceholder.setAttribute).toHaveBeenCalledWith('type', 'text/css');
            expect(mockPlaceholder.classList.add).toHaveBeenCalledWith('scope-class-1');
            expect(mockPlaceholder.classList.add).toHaveBeenCalledWith('scope-class-2');
            expect(secondElement.replaceWith).toHaveBeenCalledWith(mockPlaceholder);
            expect(secondElement.remove).not.toHaveBeenCalled();
        });

        it('should handle multiple different style-ids correctly', () => {
            const mockStylesheet1 = { replaceSync: vi.fn() };
            const mockStylesheet2 = { replaceSync: vi.fn() };
            mockCSSStyleSheet
                .mockReturnValueOnce(mockStylesheet1)
                .mockReturnValueOnce(mockStylesheet2);

            // First style ID
            const element1 = {
                getAttribute: vi.fn().mockReturnValue('style-1'),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue({ innerHTML: 'body { color: red; }' }),
                }),
                remove: vi.fn(),
            };
            StyleDeduplicatorClass.prototype.connectedCallback.call(element1);

            // Different style ID
            const element2 = {
                getAttribute: vi.fn().mockReturnValue('style-2'),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue({ innerHTML: 'body { color: blue; }' }),
                }),
                remove: vi.fn(),
            };
            StyleDeduplicatorClass.prototype.connectedCallback.call(element2);

            expect(mockStylesheet1.replaceSync).toHaveBeenCalledWith('body { color: red; }');
            expect(mockStylesheet2.replaceSync).toHaveBeenCalledWith('body { color: blue; }');
            expect(element1.remove).toHaveBeenCalled();
            expect(element2.remove).toHaveBeenCalled();
        });

        it('should preserve class list when creating placeholder element', () => {
            const mockStylesheet = { replaceSync: vi.fn() };
            mockCSSStyleSheet.mockReturnValue(mockStylesheet);
            const mockPlaceholder = {
                setAttribute: vi.fn(),
                classList: { add: vi.fn() },
            };
            (document.createElement as any).mockReturnValue(mockPlaceholder);

            const styleId = 'test-style-id';

            // First element - creates cache
            const firstElement = {
                getAttribute: vi.fn().mockReturnValue(styleId),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue({ innerHTML: 'body { color: red; }' }),
                }),
                remove: vi.fn(),
            };
            StyleDeduplicatorClass.prototype.connectedCallback.call(firstElement);

            // Second element - should copy classes
            const classNames = ['lwc-abc123', 'scope-token', 'another-class'];
            const secondElement = {
                getAttribute: vi.fn().mockReturnValue(styleId),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue({ innerHTML: 'body { color: red; }' }),
                }),
                classList: {
                    forEach: vi.fn((callback) => {
                        classNames.forEach(callback);
                    }),
                },
                replaceWith: vi.fn(),
            };

            StyleDeduplicatorClass.prototype.connectedCallback.call(secondElement);

            classNames.forEach((className) => {
                expect(mockPlaceholder.classList.add).toHaveBeenCalledWith(className);
            });
        });

        it('should handle empty class list without errors', () => {
            const mockStylesheet = { replaceSync: vi.fn() };
            mockCSSStyleSheet.mockReturnValue(mockStylesheet);
            const mockPlaceholder = {
                setAttribute: vi.fn(),
                classList: { add: vi.fn() },
            };
            (document.createElement as any).mockReturnValue(mockPlaceholder);

            const styleId = 'test-style-id';

            // First element - creates cache
            const firstElement = {
                getAttribute: vi.fn().mockReturnValue(styleId),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue({ innerHTML: 'body { color: red; }' }),
                }),
                remove: vi.fn(),
            };
            StyleDeduplicatorClass.prototype.connectedCallback.call(firstElement);

            // Second element with empty class list
            const secondElement = {
                getAttribute: vi.fn().mockReturnValue(styleId),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue({ innerHTML: 'body { color: red; }' }),
                }),
                classList: {
                    forEach: vi.fn(), // Called but no classes to iterate
                },
                replaceWith: vi.fn(),
            };

            expect(() => {
                StyleDeduplicatorClass.prototype.connectedCallback.call(secondElement);
            }).not.toThrow();

            expect(secondElement.replaceWith).toHaveBeenCalledWith(mockPlaceholder);
            expect(mockPlaceholder.classList.add).not.toHaveBeenCalled();
        });

        it('should add stylesheet to adoptedStyleSheets for cached entries', () => {
            const mockStylesheet = { replaceSync: vi.fn() };
            mockCSSStyleSheet.mockReturnValue(mockStylesheet);
            const styleId = 'test-style-id';

            // First element - creates cache
            const firstElement = {
                getAttribute: vi.fn().mockReturnValue(styleId),
                getRootNode: vi.fn().mockReturnValue({
                    adoptedStyleSheets: [],
                    getElementById: vi.fn().mockReturnValue({ innerHTML: 'body { color: red; }' }),
                }),
                remove: vi.fn(),
            };
            StyleDeduplicatorClass.prototype.connectedCallback.call(firstElement);

            // Second element - should add to adoptedStyleSheets
            const secondRoot = { adoptedStyleSheets: [] };
            const secondElement = {
                getAttribute: vi.fn().mockReturnValue(styleId),
                getRootNode: vi.fn().mockReturnValue(secondRoot),
                classList: { forEach: vi.fn() },
                replaceWith: vi.fn(),
            };

            const mockPlaceholder = {
                setAttribute: vi.fn(),
                classList: { add: vi.fn() },
            };
            (document.createElement as any).mockReturnValue(mockPlaceholder);

            StyleDeduplicatorClass.prototype.connectedCallback.call(secondElement);

            expect(secondRoot.adoptedStyleSheets).toHaveLength(1);
            expect(secondRoot.adoptedStyleSheets[0]).toHaveProperty('replaceSync');
        });
    });
});

describe('Karma test environment', () => {
    it('should expose cache clearing function in test-karma-lwc environment', async () => {
        // Save original values
        const originalProcess = (global as any).process;
        const originalWindow = (global as any).window;

        try {
            // Mock test-karma-lwc environment
            (global as any).process = {
                env: { NODE_ENV: 'test-karma-lwc' },
            };
            (global as any).window = {};

            // Re-import the module to trigger the environment check
            vi.resetModules();

            // Import should set up the cache clearing function
            await import('../index');

            expect((global as any).window.__lwcClearStylesheetCache).toBeTypeOf('function');
        } finally {
            // Restore original values
            (global as any).process = originalProcess;
            (global as any).window = originalWindow;
        }
    });
});
