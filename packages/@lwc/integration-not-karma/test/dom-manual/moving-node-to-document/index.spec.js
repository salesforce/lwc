import { createElement } from 'lwc';
import Container from 'x/container';

function createTestContainer(classForSpanInPortal) {
    const elm = createElement('x-container', { is: Container });
    document.body.appendChild(elm);
    const spanInPortal = document.createElement('span');
    if (classForSpanInPortal) {
        spanInPortal.classList.add(classForSpanInPortal);
    }
    const portalElement = elm.shadowRoot.querySelector('div');

    return {
        portalElement,
        spanInPortal,
    };
}

describe('Moving elements from inside lwc:dom=manual', () => {
    it('should return correct parentNode', () => {
        const { portalElement, spanInPortal } = createTestContainer();
        portalElement.appendChild(spanInPortal);

        return Promise.resolve().then(() => {
            document.body.appendChild(spanInPortal);

            // There is a drawback: The mutation observer is async, therefore if we access it immediately,
            // it will still have an owner key.
            return Promise.resolve().then(() => {
                expect(spanInPortal.parentNode).toBe(document.body);
            });
        });
    });

    it('should return correct results in querySelector', () => {
        const { portalElement, spanInPortal } = createTestContainer('qs-lwc-dom-manual');
        portalElement.appendChild(spanInPortal);

        return Promise.resolve().then(() => {
            document.body.appendChild(spanInPortal);

            // There is a drawback: The mutation observer is async, therefore if we access it immediately,
            // it will still have an owner key.
            return Promise.resolve().then(() => {
                expect(document.querySelector('.qs-lwc-dom-manual')).toBe(spanInPortal);
            });
        });
    });

    it('should return correct results in querySelectorAll', () => {
        const { portalElement, spanInPortal } = createTestContainer('qs-all-lwc-dom-manual');
        portalElement.appendChild(spanInPortal);

        return Promise.resolve().then(() => {
            document.body.appendChild(spanInPortal);

            // There is a drawback: The mutation observer is async, therefore if we access it immediately,
            // it will still have an owner key.
            return Promise.resolve().then(() => {
                expect(document.querySelectorAll('.qs-all-lwc-dom-manual')[0]).toBe(spanInPortal);
            });
        });
    });

    it('should return correct results in querySelector when node is added/removed on the same tick', () => {
        const { portalElement, spanInPortal } = createTestContainer('qs-mm-lwc-dom-manual');
        portalElement.appendChild(spanInPortal);
        portalElement.removeChild(spanInPortal);

        return Promise.resolve().then(() => {
            document.body.appendChild(spanInPortal);

            // There is a drawback: The mutation observer is async, therefore if we access it immediately,
            // it will still have an owner key.
            return Promise.resolve().then(() => {
                expect(document.querySelector('.qs-mm-lwc-dom-manual')).toBe(spanInPortal);
            });
        });
    });
});
