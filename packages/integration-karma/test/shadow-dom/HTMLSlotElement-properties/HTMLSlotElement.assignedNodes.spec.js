import { createElement } from 'test-utils';

import Slots from 'x/slots';
import Distribute from 'x/distribute';
import Nested from 'x/nested';
import NoDirectChild from 'x/noDirectChild';

it('returns the right nodes without slotted content', () => {
    const elm = createElement('x-slots', { is: Slots });
    document.body.appendChild(elm);

    const [defaultSlot, namedSlot] = elm.shadowRoot.querySelectorAll('slot');

    expect(defaultSlot.assignedNodes()).toEqual([]);
    expect(namedSlot.assignedNodes()).toEqual([]);

    expect(defaultSlot.assignedNodes({ flatten: true })).toEqual([
        defaultSlot.childNodes[0],
        defaultSlot.childNodes[1],
    ]);
    expect(namedSlot.assignedNodes({ flatten: true })).toEqual([]);
});

it('returns the distributed nodes', () => {
    const elm = createElement('x-distribute', { is: Distribute });
    document.body.appendChild(elm);

    const [A, B, C, D] = elm.shadowRoot.querySelectorAll('div');
    const [defaultSlot, fooSlot] = elm.shadowRoot.querySelector('x-slots').shadowRoot.querySelectorAll('slot');

    expect(defaultSlot.assignedNodes()).toEqual([B,D]);
    expect(fooSlot.assignedNodes()).toEqual([A,C]);
});

it('returns the right nodes on nested slot', () => {
    const elm = createElement('x-nested', { is: Nested });
    document.body.appendChild(elm);

    const [outerHost, innerHost] = elm.shadowRoot.querySelectorAll('x-slots');
    const outerSlot = outerHost.shadowRoot.querySelector('slot');
    const innerSlot = innerHost.shadowRoot.querySelector('slot');

    expect(outerSlot.assignedNodes()).toEqual([innerHost]);
    expect(innerSlot.assignedNodes()).toEqual([
        innerHost.childNodes[0],
        innerHost.childNodes[1],
    ]);

    expect(outerSlot.assignedNodes({ flatten: true })).toEqual([innerHost]);
    expect(innerSlot.assignedNodes({ flatten: true })).toEqual([
        innerHost.childNodes[0],
        innerHost.childNodes[1],
    ]);
});

fit('ignores not direct host children', () => {
    const elm = createElement('x-no-direct-child', { is: NoDirectChild });
    document.body.appendChild(elm);

    const host = elm.shadowRoot.querySelector('x-slots');
    const namedSlot = host.shadowRoot.querySelector('[name=foo]');

    expect(namedSlot.assignedNodes()).toEqual([
        host.childNodes[0],
        host.childNodes[1]
    ]);
    expect(namedSlot.assignedNodes({ flatten: true })).toEqual([
        host.childNodes[0],
        host.childNodes[1]
    ]);
});
