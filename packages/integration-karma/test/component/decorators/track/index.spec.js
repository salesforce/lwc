import { createElement } from 'test-utils';

import Properties from 'x/properties';
import SideEffect from 'x/sideEffect';

it('rerender the component when a track property is updated - literal', () => {
    const elm = createElement('x-properties', { is: Properties });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.prop').textContent).toBe('0');

    elm.mutateCmp(cmp => (cmp.prop = 1));
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('.prop').textContent).toBe('1');
    });
});

it('rerender the component when a track property is updated - object', () => {
    const elm = createElement('x-properties', { is: Properties });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('0');

    elm.mutateCmp(cmp => (cmp.obj.value = 1));
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('1');
    });
});

it('rerender the component when a track property is updated - nested object', () => {
    const elm = createElement('x-properties', { is: Properties });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.nested-obj').textContent).toBe('0');

    elm.mutateCmp(cmp => (cmp.nestedObj.value.nestedValue = 1));
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('.nested-obj').textContent).toBe('1');
    });
});

it('throws when updating a track property during render', () => {
    const elm = createElement('x-side-effect', { is: SideEffect });

    expect(() => {
        document.body.appendChild(elm);
    }).toThrowErrorDev(
        Error,
        /Invariant Violation: \[.+\]\.render\(\) method has side effects on the state of \[.+\]\.prop/
    );
});
