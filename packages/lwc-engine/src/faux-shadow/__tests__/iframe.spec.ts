import { createElement, LightningElement } from '../../framework/main';
import { getHostShadowRoot } from "../../framework/html-element";
import { wrapIframeWindow } from "../iframe";

describe('wrapped iframe window', () => {
    describe('methods', function () {
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

        it('should delegate setting location', function () {
            wrapped.location = 'foo';
            expect(setLocation).toHaveBeenCalledWith('foo');
        });

        it('should delegate window', function () {
            expect(wrapped.window).toBe('mock window');
        });

        it('should delegate top', function () {
            expect(wrapped.top).toBe('mock top');
        });

        it('should delegate self', function () {
            expect(wrapped.self).toBe('mock self');
        });

        it('should delegate parent', function () {
            expect(wrapped.parent).toBe('mock parent');
        });

        it('should delegate opener', function () {
            expect(wrapped.opener).toBe('mock opener');
        });

        it('should delegate location', function () {
            expect(wrapped.location).toBe('mock location');
        });

        it('should delegate length', function () {
            expect(wrapped.length).toBe('mock length');
        });

        it('should delegate frames', function () {
            expect(wrapped.frames).toBe('mock frames');
        });

        it('should delegate closed', function () {
            expect(wrapped.closed).toBe('mock closed');
        });

        it('should delegate close', function () {
            wrapped.close();
            expect(contentWindow.close).toHaveBeenCalled();
        });

        it('should delegate focus', function () {
            wrapped.focus();
            expect(contentWindow.focus).toHaveBeenCalled();
        });

        it('should delegate postMessage', function () {
            wrapped.postMessage('foo', '*');
            expect(contentWindow.postMessage).toHaveBeenCalledWith('foo', '*');
        });

        it('should delegate blur', function () {
            wrapped.blur();
            expect(contentWindow.blur).toHaveBeenCalled();
        });
    });

    describe('unwrapping', function () {
        it('should return original object', function () {
            function html($api) {
                return [$api.h('iframe', { key: 0, src: 'https://salesforce.com' }, [])];
            }
            class MyComponent extends LightningElement {
                render() {
                    return html;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            const nativeIframeContentWindow = document.querySelector('iframe').contentWindow;
            const wrappedIframe = getHostShadowRoot(elm).querySelector('iframe'); // will return monkey patched contentWindow
            const contentWindowGetter = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow').get;
            expect(nativeIframeContentWindow === contentWindowGetter.call(wrappedIframe)).toBe(true);
        });
    });
});
