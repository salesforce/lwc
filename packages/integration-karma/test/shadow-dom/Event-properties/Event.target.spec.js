import { createElement } from 'lwc';

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
        beforeAll(() => {
            // Supresses error logging
            spyOn(console, 'error');
        });

        it('should not retarget when the target was manually added without lwc:dom="manual" and accessed asynchronously [W-6626752]', (done) => {
            const container = createElement('x-container', { is: Container });
            document.body.appendChild(container);

            const child = container.shadowRoot.querySelector('x-child');
            const span = child.shadowRoot.querySelector('.container-for-manually-added-span span');

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
            const span = child.shadowRoot.querySelector('.container-for-manually-added-span span');

            document.addEventListener(
                'test',
                (event) => {
                    expect(event.target).toEqual(span);
                    done();
                },
                { once: true }
            );

            span.dispatchEvent(new CustomEvent('test', { bubbles: true, composed: true }));
        });
    });
}
