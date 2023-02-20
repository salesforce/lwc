import { createElement } from 'lwc';
import SlotFallback from 'x/slotFallback';
import WithLwcDynamic from 'x/withLwcDynamic';
import WithEach from 'x/withEach';
import WithDynamic from 'x/withDynamic';

describe('updateDynamicChildren diffing algo', () => {
    it('should render slot default elements in correct order', function () {
        const elm = createElement('x-slot-fallback', { is: SlotFallback });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('25');
        elm.triggerDiffingAlgo();

        return Promise.resolve().then(() => {
            const content = elm.shadowRoot.textContent;
            expect(content).toBe('1235');
        });
    });

    it('should render template with foreach in correct order', function () {
        const elm = createElement('x-with-each', { is: WithEach });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('25');
        elm.triggerDiffingAlgo();

        return Promise.resolve().then(() => {
            const content = elm.shadowRoot.textContent;
            expect(content).toBe('1235');
        });
    });

    it('should render template with dynamic component in correct order using lwc:dynamic', function () {
        const elm = createElement('x-with-dynamic', { is: WithLwcDynamic });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('25');
        elm.triggerDiffingAlgo();

        return Promise.resolve().then(() => {
            const content = elm.shadowRoot.textContent;
            expect(content).toBe('1235');
        });
    });

    it('should render template with dynamic component in correct order', function () {
        const elm = createElement('x-with-dynamic', { is: WithDynamic });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('25');
        elm.triggerDiffingAlgo();

        return Promise.resolve().then(() => {
            const content = elm.shadowRoot.textContent;
            expect(content).toBe('1235');
        });
    });
});
