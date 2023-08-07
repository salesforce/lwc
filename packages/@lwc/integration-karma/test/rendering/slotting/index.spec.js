import { createElement } from 'lwc';
import { spyConsole } from 'test-utils';
import RenderCountParent from 'x/renderCountParent';
import FallbackContentReuseParent from 'x/fallbackContentReuseParent';
import RegressionContainer from 'x/regressionContainer';
import FallbackContentReuseDynamicKeyParent from 'x/fallbackContentReuseDynamicKeyParent';
import UnknownSlotShadow from 'x/unknownSlotShadow';
import UnknownSlotLight from 'x/unknownSlotLight';

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

[
    {
        type: 'static',
        tag: 'x-fallback-content-reuse-parent',
        Ctor: FallbackContentReuseParent,
    },
    {
        type: 'dynamic',
        tag: 'x-fallback-content-reuse-dynamic-key-parent',
        Ctor: FallbackContentReuseDynamicKeyParent,
    },
].forEach(({ type, tag, Ctor }) => {
    it(`#663 - should not reuse elements from the fallback slot content - ${type} key`, () => {
        const childTag = tag.replace('parent', 'child');
        const elm = createElement(tag, {
            is: Ctor,
        });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector(childTag).innerHTML).toBe('');
        elm.renderSlotted = true;

        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector(childTag).innerHTML).toBe(
                '<div>Default slotted</div><div slot="foo">Named slotted</div>'
            );
        });
    });
});

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

describe('does not log an error/warning on unknown slot name', () => {
    let consoleSpy;
    beforeEach(() => {
        consoleSpy = spyConsole();
    });
    afterEach(() => {
        consoleSpy.reset();
    });

    it('shadow dom', async () => {
        const elm = createElement('x-unknown-slot-shadow', { is: UnknownSlotShadow });
        document.body.appendChild(elm);

        await Promise.resolve();

        // nothing slotted into the child
        expect(
            elm.shadowRoot
                .querySelector('x-unknown-slot-shadow-child')
                .shadowRoot.querySelector('slot')
                .assignedNodes().length
        ).toEqual(0);

        expect(consoleSpy.calls.error.length).toEqual(0);
        expect(consoleSpy.calls.warn.length).toEqual(0);
    });

    it('light dom', async () => {
        const elm = createElement('x-unknown-slot-light', { is: UnknownSlotLight });
        document.body.appendChild(elm);

        await Promise.resolve();

        // nothing slotted into the child
        expect(elm.querySelector('x-unknown-slot-light-child').children.length).toEqual(0);

        expect(consoleSpy.calls.error.length).toEqual(0);
        expect(consoleSpy.calls.warn.length).toEqual(0);
    });
});
