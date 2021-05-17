import { createElement } from 'lwc';
import { itWithLightDOM } from 'test-utils';

import RenderCountParent from 'x/renderCountParent';
import FallbackContentReuseParent from 'x/fallbackContentReuseParent';
import RegressionContainer from 'x/regressionContainer';

// TODO [#1617]: Engine currently has trouble with slotting and invocation of the renderedCallback.
xit('should not render if the slotted content changes', () => {
    const elm = createElement('x-render-count-parent', { is: RenderCountParent });
    elm.value = 'initial';
    document.body.appendChild(elm);

    expect(elm.getRenderCount()).toBe(1);
    expect(elm.shadowRoot.querySelector('x-render-count-child').getRenderCount()).toBe(1);
    expect(elm.shadowRoot.querySelector('div').textContent).toBe('initial');

    elm.value = 'updated';

    return Promise.resolve().then(() => {
        expect(elm.getRenderCount()).toBe(2);
        expect(elm.shadowRoot.querySelector('x-render-count-child').getRenderCount()).toBe(1);
        expect(elm.shadowRoot.querySelector('div').textContent).toBe('updated');
    });
});

itWithLightDOM(
    '#663 - should not reuse elements from the fallback slot content',
    FallbackContentReuseParent,
    (shadow) => () => {
        const elm = createElement('x-fallback-content-reuse-parent', {
            is: FallbackContentReuseParent,
        });
        document.body.appendChild(elm);
        const template = shadow ? elm.shadowRoot : elm;

        expect(template.querySelector('x-fallback-content-reuse-child').innerHTML).toBe('');
        elm.renderSlotted = true;

        return Promise.resolve().then(() => {
            expect(template.querySelector('x-fallback-content-reuse-child').innerHTML).toBe(
                '<div>Default slotted</div><div slot="foo">Named slotted</div>'
            );
        });
    }
);

it('should not throw error when updating slotted content triggers next tick re-render in component receiving the slotted content', (done) => {
    // Regression introduced in #1617 refactor(engine): improving the diffing algo for slotted elements
    const elm = createElement('x-regression-container', {
        is: RegressionContainer,
    });
    document.body.appendChild(elm);

    requestAnimationFrame(() => {
        const results = elm.shadowRoot.querySelectorAll('.text-result');

        expect(results.length).toBe(1);
        expect(results[0].textContent).toBe('Inner visible truetoggle');
        elm.shadowRoot.querySelector('button').click();

        requestAnimationFrame(() => {
            const results = elm.shadowRoot.querySelectorAll('.text-result');

            expect(results.length).toBe(1);
            expect(results[0].textContent).toBe('Inner visible falsetoggle');

            done();
        });
    });
});
