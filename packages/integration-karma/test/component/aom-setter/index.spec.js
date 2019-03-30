import { createElement } from 'test-utils';

import Parent from 'x/parent';

let parent;

beforeAll(() => {
    parent = createElement('x-parent', { is: Parent });
    document.body.appendChild(parent);
});

it('should call AOM setter', () => {
    const child = parent.shadowRoot.querySelector('x-child');
    const elm = child.shadowRoot.querySelector('span');
    expect(elm.textContent).toBe('KIX to HKG');
});

it('should not reflect when calling AOM setter', () => {
    const child = parent.shadowRoot.querySelector('x-child');
    expect(child.hasAttribute('aria-label')).toBe(false);
});

it('should reflect AOM attribute for native element', () => {
    const elm = parent.shadowRoot.querySelector('div');
    expect(elm.getAttribute('aria-label')).toBe('KIX to HKG');
});
