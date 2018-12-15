/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../framework/main';
import { wrapIframeWindow } from "../iframe";

describe('wrapped iframe window', () => {
    describe('methods', () => {
        let contentWindow;
        let wrapped;
        let setLocation;
        beforeEach(() => {
            setLocation = jest.fn();
            contentWindow = {
                postMessage: jest.fn(),
                blur: jest.fn(),
                close: jest.fn(),
                focus: jest.fn(),
                get closed() {
                    return 'mock closed';
                },
                get frames() {
                    return 'mock frames';
                },
                get length() {
                    return 'mock length';
                },
                get location() {
                    return 'mock location';
                },
                set location(value) {
                    setLocation(value);
                },
                get opener() {
                    return 'mock opener';
                },
                get parent() {
                    return 'mock parent';
                },
                get self() {
                    return 'mock self';
                },
                get top() {
                    return 'mock top';
                },
                get window() {
                    return 'mock window';
                },
            };

            wrapped = wrapIframeWindow(contentWindow);
        });

        it('should delegate setting location', () => {
            wrapped.location = 'foo';
            expect(setLocation).toHaveBeenCalledWith('foo');
        });

        it('should delegate window', () => {
            expect(wrapped.window).toBe('mock window');
        });

        it('should delegate top', () => {
            expect(wrapped.top).toBe('mock top');
        });

        it('should delegate self', () => {
            expect(wrapped.self).toBe('mock self');
        });

        it('should delegate parent', () => {
            expect(wrapped.parent).toBe('mock parent');
        });

        it('should delegate opener', () => {
            expect(wrapped.opener).toBe('mock opener');
        });

        it('should delegate location', () => {
            expect(wrapped.location).toBe('mock location');
        });

        it('should delegate length', () => {
            expect(wrapped.length).toBe('mock length');
        });

        it('should delegate frames', () => {
            expect(wrapped.frames).toBe('mock frames');
        });

        it('should delegate closed', () => {
            expect(wrapped.closed).toBe('mock closed');
        });

        it('should delegate close', () => {
            wrapped.close();
            expect(contentWindow.close).toHaveBeenCalled();
        });

        it('should delegate focus', () => {
            wrapped.focus();
            expect(contentWindow.focus).toHaveBeenCalled();
        });

        it('should delegate postMessage', () => {
            wrapped.postMessage('foo', '*');
            expect(contentWindow.postMessage).toHaveBeenCalledWith('foo', '*');
        });

        it('should delegate blur', () => {
            wrapped.blur();
            expect(contentWindow.blur).toHaveBeenCalled();
        });
    });
});
