import { createElement } from 'lwc';
import SlotFallback from 'x/slotFallback';
import WithDynamic from 'x/withDynamic';
import WithEach from 'x/withEach';

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
