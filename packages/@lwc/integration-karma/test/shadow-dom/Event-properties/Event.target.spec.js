import { createElement } from 'lwc';

import Container from 'x/container';

describe('Event.target', () => {
    let globalListener = () => {};
    afterEach(() => {
        document.removeEventListener('test', globalListener);
    });

    it('should retarget', (done) => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        const child = container.shadowRoot.querySelector('x-child');
        child.addEventListener('test', (event) => {
            expect(event.target).toEqual(child);
            done();
        });

        const div = child.shadowRoot.querySelector('div');
        div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
    });

    it('should patch the prototype instead of the instance', () => {
        const container = createElement('x-container', { is: Container });
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
            container.shadowRoot.querySelector('x-child'),
            new CustomEvent('test', { bubbles: true, composed: true })
        );

        expect(hasOwnProperty.call(Event.prototype, 'target')).toBeTrue();
    });

    it('should retarget to the root component when accessed asynchronously', () => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        let event;
        const child = container.shadowRoot.querySelector('x-child');
        child.addEventListener('test', (e) => {
            event = e;
        });

        const div = child.shadowRoot.querySelector('div');
        div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));

        expect(event.target).toEqual(container);
    });

    it('should retarget when accessed in a document event listener', (done) => {
        const container = createElement('x-container', { is: Container });
        document.body.appendChild(container);

        globalListener = (event) => {
            expect(event.target).toEqual(container);
            done();
        };
        document.addEventListener('test', globalListener);

        const child = container.shadowRoot.querySelector('x-child');
        const div = child.shadowRoot.querySelector('div');
        div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
    });

    if (!process.env.NATIVE_SHADOW) {
        describe('legacy behavior', () => {
            beforeAll(() => {
                // Suppress error logging
                spyOn(console, 'warn');
            });

            it('should not retarget when the target was manually added without lwc:dom="manual" and accessed asynchronously [W-6626752]', (done) => {
                const container = createElement('x-container', { is: Container });
                document.body.appendChild(container);

                const child = container.shadowRoot.querySelector('x-child');
                const span = child.appendSpanAndReturn();

                container.addEventListener('test', (event) => {
                    expect(event.target).toEqual(container);
                    setTimeout(() => {
                        expect(event.target).toEqual(span);
                        done();
                    });
                });

                span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
            });

            it('should not retarget when the target was manually added without lwc:dom="manual" and accessed in a document event listener [W-6626752]', (done) => {
                const container = createElement('x-container', { is: Container });
                document.body.appendChild(container);

                const child = container.shadowRoot.querySelector('x-child');
                const span = child.appendSpanAndReturn();

                globalListener = (event) => {
                    expect(event.target).toEqual(span);
                    done();
                };
                document.addEventListener('test', globalListener);

                span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
            });
        });
    }
});
