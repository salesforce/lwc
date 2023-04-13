import { createElement } from 'lwc';
import Test from 'x/test';

describe('add handleEvent support', () => {
    function test(elm) {
        let invoked = false;
        const listenerObject = {
            handleEvent() {
                invoked = true;
            },
        };
        elm.addEventListener('foo', listenerObject);
        elm.dispatchEvent(new CustomEvent('foo'));
        expect(invoked).toBe(true);
    }

    it('host element', () => {
        test(createElement('x-test', { is: Test }));
    });

    it('native element', () => {
        test(document.createElement('div'));
    });
});

describe('remove handleEvent support', () => {
    describe('listener object identity', () => {
        function test(elm) {
            let invoked = false;
            const listenerObject = {};

            listenerObject.handleEvent = () => {
                invoked = true;
            };
            elm.addEventListener('foo', listenerObject);

            listenerObject.handleEvent = () => {
                invoked = true;
            };
            elm.removeEventListener('foo', listenerObject);

            elm.dispatchEvent(new CustomEvent('foo'));
            expect(invoked).toBe(false);
        }

        it('host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });
    });

    describe('listener identity', () => {
        function test(elm) {
            let invoked = false;
            const handleEvent = function () {
                invoked = true;
            };
            elm.addEventListener('foo', { handleEvent });
            elm.removeEventListener('foo', { handleEvent });
            elm.dispatchEvent(new CustomEvent('foo'));
            expect(invoked).toBe(true);
        }

        it('host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });
    });
});

describe('dedupe behavior for add handleEvent', () => {
    describe('listener object identity', () => {
        function test(elm) {
            let count = 0;
            const listenerObject = {};

            listenerObject.handleEvent = () => {
                count += 1;
            };
            elm.addEventListener('foo', listenerObject);

            listenerObject.handleEvent = () => {
                count += 1;
            };
            elm.addEventListener('foo', listenerObject);

            elm.dispatchEvent(new CustomEvent('foo'));
            expect(count).toBe(1);
        }

        it('host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });
    });

    describe('listener identity', () => {
        function test(elm) {
            let count = 0;
            const handleEvent = () => {
                count += 1;
            };
            elm.addEventListener('foo', { handleEvent });
            elm.addEventListener('foo', { handleEvent });
            elm.dispatchEvent(new CustomEvent('foo'));
            expect(count).toBe(2);
        }

        it('host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });
    });
});
