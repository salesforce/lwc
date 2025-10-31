import { createElement } from 'lwc';
import RenderCountParent from 'c/renderCountParent';
import FallbackContentReuseParent from 'c/fallbackContentReuseParent';
import RegressionContainer from 'c/regressionContainer';
import FallbackContentReuseDynamicKeyParent from 'c/fallbackContentReuseDynamicKeyParent';
import UnknownSlotShadow from 'c/unknownSlotShadow';
import UnknownSlotLight from 'c/unknownSlotLight';
import { spyOn } from '@vitest/spy';

// TODO [#1617]: Engine currently has trouble with slotting and invocation of the renderedCallback.
xit('should not render if the slotted content changes', async () => {
    const elm = createElement('c-render-count-parent', { is: RenderCountParent });
    elm.value = 'initial';
    document.body.appendChild(elm);

    expect(elm.getRenderCount()).toBe(1);
    expect(elm.shadowRoot.querySelector('c-render-count-child').getRenderCount()).toBe(1);
    expect(elm.shadowRoot.querySelector('div').textContent).toBe('initial');

    elm.value = 'updated';

    await Promise.resolve();
    expect(elm.getRenderCount()).toBe(2);
    expect(elm.shadowRoot.querySelector('c-render-count-child').getRenderCount()).toBe(1);
    expect(elm.shadowRoot.querySelector('div').textContent).toBe('updated');
});

[
    {
        type: 'static',
        tag: 'c-fallback-content-reuse-parent',
        Ctor: FallbackContentReuseParent,
    },
    {
        type: 'dynamic',
        tag: 'c-fallback-content-reuse-dynamic-key-parent',
        Ctor: FallbackContentReuseDynamicKeyParent,
    },
].forEach(({ type, tag, Ctor }) => {
    it(`#663 - should not reuse elements from the fallback slot content - ${type} key`, async () => {
        const childTag = tag.replace('parent', 'child');
        const elm = createElement(tag, {
            is: Ctor,
        });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector(childTag).innerHTML).toBe('');
        elm.renderSlotted = true;

        await Promise.resolve();
        expect(elm.shadowRoot.querySelector(childTag).innerHTML).toBe(
            '<div>Default slotted</div><div slot="foo">Named slotted</div>'
        );
    });
});

it('should not throw error when updating slotted content triggers next tick re-render in component receiving the slotted content', async () => {
    // Regression introduced in #1617 refactor(engine): improving the diffing algo for slotted elements
    const elm = createElement('c-regression-container', {
        is: RegressionContainer,
    });
    document.body.appendChild(elm);

    await new Promise(requestAnimationFrame);

    let results = elm.shadowRoot.querySelectorAll('.text-result');
    expect(results.length).toBe(1);
    expect(results[0].textContent).toBe('Inner visible truetoggle');
    elm.shadowRoot.querySelector('button').click();

    await new Promise(requestAnimationFrame);

    results = elm.shadowRoot.querySelectorAll('.text-result');
    expect(results.length).toBe(1);
    expect(results[0].textContent).toBe('Inner visible falsetoggle');
});

describe('does not log an error/warning on unknown slot name', () => {
    let warnSpy;
    let errorSpy;
    beforeEach(() => {
        warnSpy = spyOn(console, 'warn');
        errorSpy = spyOn(console, 'error');
    });
    afterEach(() => {
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('shadow dom', async () => {
        const elm = createElement('c-unknown-slot-shadow', { is: UnknownSlotShadow });
        document.body.appendChild(elm);

        await Promise.resolve();

        // nothing slotted into the child
        expect(
            elm.shadowRoot
                .querySelector('c-unknown-slot-shadow-child')
                .shadowRoot.querySelector('slot')
                .assignedNodes().length
        ).toEqual(0);

        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('light dom', async () => {
        const elm = createElement('c-unknown-slot-light', { is: UnknownSlotLight });
        document.body.appendChild(elm);

        await Promise.resolve();

        // nothing slotted into the child
        expect(elm.querySelector('c-unknown-slot-light-child').children.length).toEqual(0);

        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
    });
});
