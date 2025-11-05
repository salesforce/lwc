import { createElement } from 'lwc';

import Parent from 'x/parent';

import RoleTester, { roleSetterCallCount } from 'x/roleTester';

describe('aom-setter', () => {
    let parent;

    beforeEach(() => {
        parent = createElement('x-parent', { is: Parent });
        document.body.appendChild(parent);
    });

    it('should override native AOM setter and render text content', () => {
        const child = parent.shadowRoot.querySelector('x-child');
        const elm = child.shadowRoot.querySelector('span');
        expect(elm.textContent).toBe('KIX to HKG');
    });

    it('should disable default behavior of DOM reflection when invoking a custom AOM setter', () => {
        const child = parent.shadowRoot.querySelector('x-child');
        expect(child.hasAttribute('aria-label')).toBe(false);
    });

    it('should reflect AOM attribute for native element', () => {
        const elm = parent.shadowRoot.querySelector('div');
        expect(elm.getAttribute('aria-label')).toBe('KIX to HKG');
    });

    describe('#role', () => {
        it('should call setter when defined', () => {
            const element = createElement('prop-getter-aria-role', { is: RoleTester });
            document.body.appendChild(element);
            element.role = 'tab';
            expect(roleSetterCallCount).toBe(1);
        });
    });
});
