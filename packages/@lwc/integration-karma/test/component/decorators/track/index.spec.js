import { LightningElement, api, track, createElement } from 'lwc';

import Properties from 'x/properties';
import SideEffect from 'x/sideEffect';
import NonObservable from 'x/nonObservable';
import SetTrackedValueToNull from 'x/setTrackedValueToNull';

import duplicatePropertyTemplate from 'x/duplicatePropertyTemplate';

it('rerenders the component when a track property is updated - literal', () => {
    const elm = createElement('x-properties', { is: Properties });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.prop').textContent).toBe('0');

    elm.mutateCmp((cmp) => (cmp.prop = 1));
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('.prop').textContent).toBe('1');
    });
});

it('rerenders the component when a track property is updated - object', () => {
    const elm = createElement('x-properties', { is: Properties });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('0');

    elm.mutateCmp((cmp) => (cmp.obj.value = 1));
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('1');
    });
});

describe('restrictions', () => {
    it('logs an error when updating a track property during render', () => {
        const elm = createElement('x-side-effect', { is: SideEffect });

        expect(() => {
            document.body.appendChild(elm);
        }).toLogErrorDev(/\[.+\]\.render\(\) method has side effects on the state of \[.+\]\.prop/);
    });

    it('logs a property error when a track field conflicts with a method', () => {
        expect(() => {
            // The following class is wrapped by the compiler with registerDecorators. We check here
            // if the fields are validated properly.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class Invalid extends LightningElement {
                @track showFeatures;
                // eslint-disable-next-line no-dupe-class-members
                showFeatures() {}
            }
        }).toLogErrorDev(
            /Invalid @track showFeatures field\. Found a duplicate method with the same name\./
        );
    });

    it('logs a property error when a track field conflicts with an accessor', () => {
        expect(() => {
            // The following class is wrapped by the compiler with registerDecorators. We check here
            // if the fields are validated properly.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class Invalid extends LightningElement {
                @track showFeatures;
                // eslint-disable-next-line no-dupe-class-members
                get showFeatures() {
                    return 1;
                }
                // eslint-disable-next-line no-dupe-class-members
                set showFeatures(v) {}
            }
        }).toLogErrorDev(
            /Invalid @track showFeatures field\. Found a duplicate accessor with the same name\./
        );
    });
});

describe('object mutations', () => {
    it('rerenders the component when a property is updated', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.nested-obj').textContent).toBe('0');

        elm.mutateCmp((cmp) => (cmp.nestedObj.value.nestedValue = 1));
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.nested-obj').textContent).toBe('1');
        });
    });

    it('rerenders the component when a property is deleted', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp((cmp) => {
            delete cmp.obj.value;
        });
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('');
        });
    });

    it('rerenders the component when a track is defined using Object.defineProperty', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp((cmp) => {
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

        elm.mutateCmp((cmp) => {
            cmp.obj = { value: 1 };
            Object.freeze(cmp.obj);
        });
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.obj').textContent).toBe('1');
        });
    });

    it('should not log an error when setting tracked value to null', () => {
        const elm = createElement('x-foo-tracked-null', { is: SetTrackedValueToNull });

        expect(() => document.body.appendChild(elm)).not.toLogErrorDev();
    });
});

describe('array mutations', () => {
    it('rerenders the component if a new item is added via Array.prototype.push', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp((cmp) => cmp.array.push(4));
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.array').textContent).toBe('1234');
        });
    });

    it('rerenders the component if an item is removed via Array.prototype.pop', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp((cmp) => cmp.array.pop());
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.array').textContent).toBe('12');
        });
    });

    it('rerenders the component if an item is removed via Array.prototype.pop', () => {
        const elm = createElement('x-properties', { is: Properties });
        document.body.appendChild(elm);

        elm.mutateCmp((cmp) => cmp.array.unshift(4));
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('.array').textContent).toBe('4123');
        });
    });
});

describe('non-observable values', () => {
    it('should not throw an error when accessing a non-observable property from a tracked property before rendering', () => {
        const elm = createElement('x-foo', { is: NonObservable });
        elm.foo = new Map();
        expect(() => {
            elm.foo;
        }).not.toThrow();
    });
});

describe('regression [W-9927596] - track field with duplicate observed field', () => {
    it('log errors when evaluated and preserve the public property', () => {
        let Ctor;

        expect(() => {
            class DuplicateProperty extends LightningElement {
                foo;
                // eslint-disable-next-line no-dupe-class-members
                @track foo = { name: 'track' };

                @api updateProperty(name) {
                    this.foo.name = name;
                }

                render() {
                    return duplicatePropertyTemplate;
                }
            }

            Ctor = DuplicateProperty;
        }).toLogErrorDev(
            /Invalid observed foo field\. Found a duplicate accessor with the same name\./
        );

        const elm = createElement('x-duplicate-property', { is: Ctor });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('p').textContent).toBe('track');

        elm.updateProperty('updated');
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('p').textContent).toBe('updated');
        });
    });
});
