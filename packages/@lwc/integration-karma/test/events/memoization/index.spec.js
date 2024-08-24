import { createElement } from 'lwc';
import Deep from 'x/deep';
import List from 'x/list';

describe('deep listener', () => {
    beforeEach(() => {
        window.clickBuffer = [];
    });

    afterEach(() => {
        delete window.clickBuffer;
    });

    // In this case, `logger.onClick` is never re-bound because the `logger` is
    // scoped to the component, so the event listener memoization optimization causes
    // the listener to be bound once and never redefined
    it('does not redefine the onClick for a single deep listener', async () => {
        const elm = createElement('x-deep', { is: Deep });
        document.body.appendChild(elm);

        elm.logger = { onClick: () => window.clickBuffer.push(1) }; // never called
        await Promise.resolve();
        elm.shadowRoot.querySelector('button').click();
        expect(window.clickBuffer).toEqual([0]);

        elm.logger = { onClick: () => window.clickBuffer.push(2) }; // never called
        await Promise.resolve();
        elm.shadowRoot.querySelector('button').click();
        expect(window.clickBuffer).toEqual([0, 0]);
    });

    // In this case, the click listener is re-bound on every render, because the referenced
    // listener is scoped inside a <template for:each>
    it('does redefine the onClick for a list of deep click listeners', async () => {
        const elm = createElement('x-list', { is: List });
        document.body.appendChild(elm);

        elm.loggers = [{ id: 1, onClick: () => window.clickBuffer.push(1) }];
        await Promise.resolve();
        elm.shadowRoot.querySelector('button').click();
        expect(window.clickBuffer).toEqual([1]);

        elm.loggers = [{ id: 2, onClick: () => window.clickBuffer.push(2) }];
        await Promise.resolve();
        elm.shadowRoot.querySelector('button').click();
        expect(window.clickBuffer).toEqual([1, 2]);
    });
});
