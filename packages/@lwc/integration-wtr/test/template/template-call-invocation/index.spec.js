import { createElement, setFeatureFlagForTest } from 'lwc';
import Component from 'x/component';
import { resetDOM } from '../../../helpers/reset.js';

// W-23790290: the engine invokes a component's compiled template function to produce its vnodes.
// The default path uses `template.call(...)`, which resolves `call` as a property lookup on the
// template function. Because a compiled template is a plain (non-frozen) function, a component can
// define an own `call` property on it, shadowing `Function.prototype.call`; the engine then invokes
// the component-supplied function and hands it the engine-internal render `api`. The
// `ENABLE_INTRINSIC_TEMPLATE_INVOCATION` flag switches invocation to the intrinsic `Reflect.apply`,
// which uses the function's internal call behavior and ignores any own `call` property.
//
// The fixture component (`x/component`) defines a benign own `call` on its template that renders a
// distinguishable "shadowed" marker and records that it received the render `api`, so both code
// paths are observable in the DOM and via component state.

describe('template invocation (W-23790290)', () => {
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_INTRINSIC_TEMPLATE_INVOCATION', false);
        resetDOM();
    });

    it('legacy path (flag off): an own `call` on the template shadows the invocation', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        // The own `call` ran instead of the real template, and it received the render api.
        expect(elm.ownCallInvoked).toBe(true);
        expect(elm.receivedRenderApi).toBe(true);
        expect(elm.shadowRoot.textContent).toBe('shadowed');
    });

    it('intrinsic path (flag on): an own `call` on the template is ignored', () => {
        setFeatureFlagForTest('ENABLE_INTRINSIC_TEMPLATE_INVOCATION', true);

        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        // Reflect.apply invokes the real template; the own `call` never runs and never sees the api.
        expect(elm.ownCallInvoked).toBe(false);
        expect(elm.receivedRenderApi).toBe(false);
        expect(elm.shadowRoot.textContent).toBe('real');
    });
});
