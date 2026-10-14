import { createElement } from 'lwc';
import Component from 'x/component';
import { resetDOM } from '../../../helpers/reset.js';

describe('template invocation (W-23790290)', () => {
    afterEach(() => {
        resetDOM();
    });

    it('intrinsic path (flag on): an own `call` on the template is ignored', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        // Reflect.apply invokes the real template; the own `call` never runs and never sees the api.
        expect(elm.ownCallInvoked).toBe(false);
        expect(elm.receivedRenderApi).toBe(false);
        expect(elm.shadowRoot.textContent).toBe('real');
    });
});
