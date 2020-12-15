import { createElement } from 'lwc';

import Container from 'x/container';

function test(eventInit, expectedLogs) {
    it(`should invoke listeners as expected for ${JSON.stringify(eventInit)}`, () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);
        elm.rootDispatchEvent(eventInit);
        expect(elm.getLogs()).toEqual(expectedLogs);
    });
}

test({ bubbles: false, composed: false }, [
    'listen-on-root-from-instance',
    'listen-on-root-from-element',
]);

test({ bubbles: false, composed: true }, [
    'listen-on-root-from-instance',
    'listen-on-root-from-element',
    'listen-on-host-from-template',
    'listen-on-host-from-instance',
    'listen-on-host-from-element',
]);

test({ bubbles: true, composed: false }, [
    'listen-on-root-from-instance',
    'listen-on-root-from-element',
]);

test({ bubbles: true, composed: true }, [
    'listen-on-root-from-instance',
    'listen-on-root-from-element',
    'listen-on-host-from-template',
    'listen-on-host-from-instance',
    'listen-on-host-from-element',
]);
