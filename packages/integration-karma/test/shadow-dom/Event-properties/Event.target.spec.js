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

    const div = child.shadowRoot.querySelector('div');
    div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
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

    document.addEventListener(
        'test',
        (event) => {
            expect(event.target).toEqual(container);
            done();
        },
        { once: true }
    );

    const child = container.shadowRoot.querySelector('x-child');
    const div = child.shadowRoot.querySelector('div');
    div.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
});

if (!process.env.NATIVE_SHADOW) {
    describe('legacy behavior', () => {
        it('should not retarget when the target was manually added and accessed asynchronously [W-6626752]', (done) => {
            const container = createElement('x-container', { is: Container });
            document.body.appendChild(container);

            const child = container.shadowRoot.querySelector('x-child');
            const span = child.shadowRoot.querySelector(
                'span.manually-appended-in-rendered-callback'
            );

            container.addEventListener('test', (event) => {
                expect(event.target).toEqual(container);
                setTimeout(() => {
                    expect(event.target).toEqual(span);
                    done();
                });
            });

            span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
        });

        let elm;
        let child;
        let originalTarget;

        beforeAll(() => {
            elm = createElement('x-parent-with-dynamic-child', {
                is: XParentWithDynamicChild,
            });
            document.body.appendChild(elm);
            child = elm.shadowRoot.querySelector('x-child-with-out-lwc-dom-manual');
            originalTarget = child.shadowRoot.querySelector('span');
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
    });
}
