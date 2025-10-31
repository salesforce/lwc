import { createElement } from 'lwc';
import SlotFallback from 'c/slotFallback';
import WithLwcDynamic from 'c/withLwcDynamic';
import WithEach from 'c/withEach';
import WithDynamic from 'c/withDynamic';

describe('updateDynamicChildren diffing algo', () => {
    it('should render slot default elements in correct order', async function () {
        const elm = createElement('c-slot-fallback', { is: SlotFallback });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('25');
        elm.triggerDiffingAlgo();

        await Promise.resolve();
        const content = elm.shadowRoot.textContent;
        expect(content).toBe('1235');
    });

    it('should render template with foreach in correct order', async function () {
        const elm = createElement('c-with-each', { is: WithEach });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('25');
        elm.triggerDiffingAlgo();

        await Promise.resolve();
        const content = elm.shadowRoot.textContent;
        expect(content).toBe('1235');
    });

    it('should render template with dynamic component in correct order using lwc:dynamic', async function () {
        const elm = createElement('c-with-dynamic', { is: WithLwcDynamic });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('25');
        elm.triggerDiffingAlgo();

        await Promise.resolve();
        const content = elm.shadowRoot.textContent;
        expect(content).toBe('1235');
    });

    it('should render template with dynamic component in correct order', async () => {
        const elm = createElement('c-with-dynamic', { is: WithDynamic });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.textContent).toBe('25');
        elm.triggerDiffingAlgo();

        await Promise.resolve();
        const content = elm.shadowRoot.textContent;
        expect(content).toBe('1235');
    });
});
