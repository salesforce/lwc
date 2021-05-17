import { createElement } from 'lwc';
import SlotFallback from 'x/slotFallback';
import WithDynamic from 'x/withDynamic';
import WithEach from 'x/withEach';
import { itWithLightDOM } from 'test-utils';

describe('updateDynamicChildren diffing algo', () => {
    itWithLightDOM(
        'should render slot default elements in correct order',
        SlotFallback,
        (shadow) => () => {
            const elm = createElement('x-slot-fallback', { is: SlotFallback });
            document.body.appendChild(elm);

            const template = shadow ? elm.shadowRoot : elm;

            expect(template.textContent).toBe('25');
            elm.triggerDiffingAlgo();

            return Promise.resolve().then(() => {
                const content = template.textContent;
                expect(content).toBe('1235');
            });
        }
    );

    itWithLightDOM(
        'should render template with foreach in correct order',
        WithEach,
        (shadow) => () => {
            const elm = createElement('x-with-each', { is: WithEach });
            document.body.appendChild(elm);

            const template = shadow ? elm.shadowRoot : elm;

            expect(template.textContent).toBe('25');
            elm.triggerDiffingAlgo();

            return Promise.resolve().then(() => {
                const content = template.textContent;
                expect(content).toBe('1235');
            });
        }
    );

    itWithLightDOM(
        'should render template with dynamic component in correct order',
        WithDynamic,
        (shadow) => () => {
            const elm = createElement('x-with-dynamic', { is: WithDynamic });
            document.body.appendChild(elm);

            const template = shadow ? elm.shadowRoot : elm;

            expect(template.textContent).toBe('25');
            elm.triggerDiffingAlgo();

            return Promise.resolve().then(() => {
                const content = template.textContent;
                expect(content).toBe('1235');
            });
        }
    );
});
