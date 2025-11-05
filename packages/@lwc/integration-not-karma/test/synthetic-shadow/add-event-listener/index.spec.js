import { createElement } from 'lwc';
import Test from 'x/test';

describe('add handleEvent support', () => {
    describe('basic', () => {
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

        it('lwc host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });

        it('lwc shadow root', () => {
            test(createElement('x-test', { is: Test }).shadowRoot);
        });

        it('native shadow root', () => {
            test(document.createElement('div').attachShadow({ mode: 'open' }));
        });
    });

    describe('listener object mutation', () => {
        function test(elm) {
            let value;
            const listenerObject = {};

            listenerObject.handleEvent = () => {
                value = 'first';
            };
            elm.addEventListener('foo', listenerObject);
            listenerObject.handleEvent = () => {
                value = 'second';
            };

            elm.dispatchEvent(new CustomEvent('foo'));
            expect(value).toBe('second');
        }

        it('lwc host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });

        it('lwc shadow root', () => {
            test(createElement('x-test', { is: Test }).shadowRoot);
        });

        it('native shadow root', () => {
            test(document.createElement('div').attachShadow({ mode: 'open' }));
        });
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

        it('lwc host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });

        it('lwc shadow root', () => {
            test(createElement('x-test', { is: Test }).shadowRoot);
        });

        it('native shadow root', () => {
            test(document.createElement('div').attachShadow({ mode: 'open' }));
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

        it('lwc host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });

        it('lwc shadow root', () => {
            test(createElement('x-test', { is: Test }).shadowRoot);
        });

        it('native shadow root', () => {
            test(document.createElement('div').attachShadow({ mode: 'open' }));
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

        it('lwc host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });

        it('lwc shadow root', () => {
            test(createElement('x-test', { is: Test }).shadowRoot);
        });

        it('native shadow root', () => {
            test(document.createElement('div').attachShadow({ mode: 'open' }));
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

        it('lwc host element', () => {
            test(createElement('x-test', { is: Test }));
        });

        it('native element', () => {
            test(document.createElement('div'));
        });

        it('lwc shadow root', () => {
            test(createElement('x-test', { is: Test }).shadowRoot);
        });

        it('native shadow root', () => {
            test(document.createElement('div').attachShadow({ mode: 'open' }));
        });
    });
});
