import { createElement } from 'lwc';
import Container from 'x/container';
import { itWithLightDOM } from 'test-utils';

describe('Dynamic diffing algo for slotted text', () => {
    itWithLightDOM(
        'should not confuse text vnodes when moving elements',
        Container,
        (shadow) => () => {
            const elm = createElement('x-container', { is: Container });
            document.body.appendChild(elm);

            const template = shadow ? elm.shadowRoot : elm;

            expect(template.textContent).toBe('first textDisplay Boolean Value: truesecond text');
            elm.toggleVisibility();

            return Promise.resolve()
                .then(() => {
                    const text = template.textContent;
                    expect(text).toBe('Display Boolean Value: false');

                    elm.toggleVisibility();
                })
                .then(() => {
                    const text = template.textContent;
                    expect(text).toBe('first textDisplay Boolean Value: truesecond text');
                });
        }
    );
});
