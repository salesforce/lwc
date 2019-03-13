import { createElement } from 'test-utils';

import Parent from 'x/parent';

it('should transform id value if it is read from the host and rendered to the shadow', () => {
    const elm = createElement('x-parent', { is: Parent });
    document.body.appendChild(elm);

    const external = elm.shadowRoot.querySelector('x-child');
    const internal = external.shadowRoot.querySelector('div');
    expect(external.id).not.toBe(internal.id);
});
