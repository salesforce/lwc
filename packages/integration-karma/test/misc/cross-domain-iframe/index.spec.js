import { unwrap } from 'lwc';
import { createElement } from 'lwc';

import Test from 'x/test';

it('should not throw when unwrapping contentWindow', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    const iframe = elm.shadowRoot.querySelector('iframe');
    expect(() => {
        unwrap(iframe.contentWindow);
    }).not.toThrowError();
});

describe('HTMLIFrameElement.contentWindow patching', () => {
    let iframe, sameOriginFrame;

    beforeEach(() => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        iframe = elm.shadowRoot.querySelector('iframe');
        sameOriginFrame = elm.shadowRoot.querySelector('[data-id="same_origin_iframe"]');
    });

    function testContentWindowProperty(name, fn) {
        it(`should not throw when accessing ${name}`, () => {
            expect(() => fn(iframe.contentWindow)).not.toThrowError();
        });
    }

    function testSameOriginContentWindowProperty(name, fn) {
        it(`should not throw when accessing ${name}`, () => {
            expect(() => fn(sameOriginFrame.contentWindow)).not.toThrowError();
        });
    }

    testContentWindowProperty('postMessage', (contentWindow) =>
        contentWindow.postMessage('foo', '*')
    );
    testContentWindowProperty('focus', (contentWindow) => contentWindow.focus());
    testContentWindowProperty('blur', (contentWindow) => contentWindow.blur());
    testContentWindowProperty('close', (contentWindow) => contentWindow.close());
    testContentWindowProperty('closed', (contentWindow) => contentWindow.closed);
    testContentWindowProperty('frames', (contentWindow) => contentWindow.frames);
    testContentWindowProperty('length', (contentWindow) => contentWindow.length);
    testContentWindowProperty('location', (contentWindow) => {
        contentWindow.location;
        contentWindow.location = 'http://example.com';
    });
    testContentWindowProperty('opener', (contentWindow) => contentWindow.opener);
    testContentWindowProperty('parent', (contentWindow) => contentWindow.parent);
    testContentWindowProperty('self', (contentWindow) => contentWindow.self);
    testContentWindowProperty('top', (contentWindow) => contentWindow.top);
    testContentWindowProperty('window', (contentWindow) => contentWindow.window);

    testSameOriginContentWindowProperty('addEventListener', (contentWindow) =>
        contentWindow.addEventListener('resize', () => {})
    );
    testSameOriginContentWindowProperty('removeEventListener', (contentWindow) => {
        contentWindow.removeEventListener('resize', () => {});
    });
});
