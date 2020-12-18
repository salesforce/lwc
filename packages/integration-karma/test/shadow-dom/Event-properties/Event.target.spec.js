import { createElement } from 'lwc';
import XParentWithDynamicChild from 'x/parentWithDynamicChild';

import Container from 'x/container';

it('should retarget', (done) => {
    const container = createElement('x-container', { is: Container });
    document.body.appendChild(container);

    const child = container.shadowRoot.querySelector('x-child');
    child.addEventListener('test', (event) => {
        expect(event.target).toEqual(child);
        done();
    });

    const span = child.shadowRoot.querySelector('span');
    span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
});

it('should retarget to the root component when accessed asynchronously', () => {
    const container = createElement('x-container', { is: Container });
    document.body.appendChild(container);

    let event;
    const child = container.shadowRoot.querySelector('x-child');
    child.addEventListener('test', (e) => {
        event = e;
    });

    const span = child.shadowRoot.querySelector('span');
    span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));

    expect(event.target).toEqual(container);
});

it('should retarget when accessed in a document event listener', (done) => {
    const container = createElement('x-container', { is: Container });
    document.body.appendChild(container);

    document.addEventListener(
        'test',
        (event) => {
            expect(event.target).toEqual(container);
            done();
        },
        { once: true }
    );

    const child = container.shadowRoot.querySelector('x-child');
    const span = child.shadowRoot.querySelector('span');
    span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
});

// legacy usecases
describe('should not retarget event', () => {
    if (!process.env.NATIVE_SHADOW) {
        let elm;
        let child;
        let originalTarget;

        beforeAll(() => {
            spyOn(console, 'error');
            elm = createElement('x-parent-with-dynamic-child', {
                is: XParentWithDynamicChild,
            });
            document.body.appendChild(elm);
            child = elm.shadowRoot.querySelector('x-child-with-out-lwc-dom-manual');
            originalTarget = child.shadowRoot.querySelector('span');
        });
        it('when original target node is not keyed and event is accessed async (W-6586380)', (done) => {
            elm.eventListener = (evt) => {
                expect(evt.currentTarget).toBe(elm.shadowRoot.querySelector('div'));
                expect(evt.target).toBe(child);
                setTimeout(() => {
                    // Expect event target to be not retargeted
                    expect(evt.currentTarget).toBeNull();
                    expect(evt.target).toBe(originalTarget);
                    done();
                });
            };
            originalTarget.click();
        });

        describe('received at a global listener', () => {
            let actualCurrentTarget;
            let actualTarget;
            const globalListener = (evt) => {
                actualCurrentTarget = evt.currentTarget;
                actualTarget = evt.target;
            };
            afterAll(() => {
                document.removeEventListener(globalListener);
            });

            it('when original target node is not keyed and currentTarget is document (W-6626752)', () => {
                document.addEventListener('click', globalListener);
                originalTarget.click();
                expect(actualCurrentTarget).toBe(document);
                expect(actualTarget).toBe(originalTarget);
            });
        });
    }
});
