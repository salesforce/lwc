import { createElement } from 'lwc';

import Properties from 'x/properties';
import SideEffect from 'x/sideEffect';

it('rerenders the component when a track property is updated - literal', () => {
    const elm = createElement('x-properties', { is: Properties });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.prop').textContent).toBe('0');

    elm.mutateCmp(cmp => (cmp.prop = 1));
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('.prop').textContent).toBe('1');
    });
});

it('rerenders the component when a track property is updated - object', () => {
    const elm = createElement('x-properties', { is: Properties });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('0');

    elm.mutateCmp(cmp => (cmp.obj.value = 1));
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('1');
    });
});

describe('restrictions', () => {
    it('throws when updating a track property during render', () => {
        const elm = createElement('x-side-effect', { is: SideEffect });

        expect(() => {
            document.body.appendChild(elm);
        }).toThrowErrorDev(
            Error,
            /Invariant Violation: \[.+\]\.render\(\) method has side effects on the state of \[.+\]\.prop/
        );
    });
});

describe('object mutations', () => {
    it('rerenders the component when a property is updated', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.nested-obj').textContent).toBe('0');

        elm.mutateCmp(cmp => (cmp.nestedObj.value.nestedValue = 1));
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.nested-obj').textContent).toBe('1');
        });
    });

    it('rerenders the component when a property is deleted', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp(cmp => {
            delete cmp.obj.value;
        });
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('');
        });
    });

    it('rerenders the component when a track is defined using Object.defineProperty', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp(cmp => {
            Object.defineProperty(cmp.obj, 'value', {
                value: 1,
            });
        });
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('1');
        });
    });

    it('should support freezing tracked property', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp(cmp => {
            cmp.obj = { value: 1 };
            Object.freeze(cmp.obj);
        });
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('1');
        });
    });
});

describe('array mutations', () => {
    it('rerenders the component if a new item is added via Array.prototype.push', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp(cmp => cmp.array.push(4));
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.array').textContent).toBe('1234');
        });
    });

    it('rerenders the component if an item is removed via Array.prototype.pop', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp(cmp => cmp.array.pop());
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.array').textContent).toBe('12');
        });
    });

    it('rerenders the component if an item is removed via Array.prototype.unshift', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp(cmp => cmp.array.unshift(4));
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.array').textContent).toBe('4123');
        });
    });
});
