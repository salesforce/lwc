import { createElement } from 'lwc';

import Container from 'c/container';
import { jasmineSpyOn as spyOn } from '../../../helpers/jasmine.js';

describe('Event.target', () => {
    let globalListener = () => {};
    afterEach(() => {
        document.removeEventListener('test', globalListener);
    });

    it('should retarget', async () => {
        const container = createElement('c-container', { is: Container });
        document.body.appendChild(container);

        const child = container.shadowRoot.querySelector('c-child');
        const target = await new Promise((resolve) => {
            child.addEventListener('test', (event) => {
                resolve(event.target);
            });

            const div = child.shadowRoot.querySelector('div');
            div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
        });
        expect(target).toBe(child);
    });

    it('should patch the prototype instead of the instance', () => {
        const container = createElement('c-container', { is: Container });
        document.body.appendChild(container);

        function dispatchEventWithAssertions(target, event) {
            const hasOwnProperty = Object.prototype.hasOwnProperty;
            for (var node = target; node; node = node.parentNode || node.host) {
                node.addEventListener(event.type, function (event) {
                    expect(hasOwnProperty.call(event, 'target')).toBeFalse();
                });
            }
            target.dispatchEvent(event);
        }
        dispatchEventWithAssertions(
            container.shadowRoot.querySelector('c-child'),
            new CustomEvent('test', { bubbles: true, composed: true })
        );

        expect(hasOwnProperty.call(Event.prototype, 'target')).toBeTrue();
    });

    it('should retarget to the root component when accessed asynchronously', () => {
        const container = createElement('c-container', { is: Container });
        document.body.appendChild(container);

        let event;
        const child = container.shadowRoot.querySelector('c-child');
        child.addEventListener('test', (e) => {
            event = e;
        });

        const div = child.shadowRoot.querySelector('div');
        div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));

        expect(event.target).toBe(container);
    });

    it('should retarget when accessed in a document event listener', async () => {
        const container = createElement('c-container', { is: Container });
        document.body.appendChild(container);

        const target = await new Promise((resolve) => {
            globalListener = (event) => {
                resolve(event.target);
            };
            document.addEventListener('test', globalListener);

            const child = container.shadowRoot.querySelector('c-child');
            const div = child.shadowRoot.querySelector('div');
            div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
        });

        expect(target).toBe(container);
    });

    describe.skipIf(process.env.NATIVE_SHADOW)('legacy behavior', () => {
        beforeAll(() => {
            // Suppress error logging
            spyOn(console, 'warn');
        });

        it('should not retarget when the target was manually added without lwc:dom="manual" and accessed asynchronously [W-6626752]', async () => {
            const container = createElement('c-container', { is: Container });
            document.body.appendChild(container);

            const child = container.shadowRoot.querySelector('c-child');
            const span = child.appendSpanAndReturn();

            const [first, second] = await new Promise((resolve) => {
                container.addEventListener('test', (event) => {
                    const first = event.target;
                    setTimeout(() => {
                        resolve([first, event.target]);
                    });
                });

                span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
            });

            expect(first).toBe(container);
            expect(second).toBe(span);
        });

        it('should not retarget when the target was manually added without lwc:dom="manual" and accessed in a document event listener [W-6626752]', async () => {
            const container = createElement('c-container', { is: Container });
            document.body.appendChild(container);

            const child = container.shadowRoot.querySelector('c-child');
            const span = child.appendSpanAndReturn();

            const target = await new Promise((resolve) => {
                globalListener = (event) => {
                    resolve(event.target);
                };
                document.addEventListener('test', globalListener);

                span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
            });

            expect(target).toBe(span);
        });
    });
});
