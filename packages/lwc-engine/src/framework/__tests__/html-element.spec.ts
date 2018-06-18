import { createElement, Element, register, unwrap } from '../main';

import assertLogger from '../assert';
import { ViewModelReflection } from "../utils";
import { querySelector } from "../dom/element";

describe('html-element', () => {
    describe('#setAttributeNS()', () => {
        it('should set attribute on host element when element is nested in template', () => {
            class Child extends Element {
                setFoo() {
                    this.setAttributeNS('x', 'foo', 'bar');
                }
            }
            Child.publicMethods = ['setFoo'];

            class Parent extends Element {
                render() {
                    return ($api) => {
                        return [$api.c('x-child', Child, {})]
                    }
                }
            }
            const element = createElement('should-set-attribute-on-host-element-when-element-is-nested-in-template', { is: Parent });
            document.body.appendChild(element);
            const child = querySelector.call(element, 'x-child');
            child.setFoo();
            expect(child.hasAttributeNS('x', 'foo')).toBe(true);
            expect(child.getAttributeNS('x', 'foo')).toBe('bar');
        });

        it('should set attribute on host element', () => {
            class MyComponent extends Element {
                setFoo() {
                    this.setAttributeNS('x', 'foo', 'bar');
                }
            }
            MyComponent.publicMethods = ['setFoo'];
            const element = createElement('x-foo', { is: MyComponent });
            element.setFoo();
            expect(element.hasAttributeNS('x', 'foo')).toBe(true);
            expect(element.getAttributeNS('x', 'foo')).toBe('bar');
        });

        it('should throw an error if attempting to call setAttributeNS during construction', () => {
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.setAttributeNS('x', 'foo', 'bar');
                    }).toThrowError("Assert Violation: Failed to construct '<x-foo>': The result must not have attributes.");
                }
            }
            createElement('x-foo', { is: MyComponent });
        });
    });

    describe('#setAttribute()', () => {
        it('should set attribute on host element when element is nested in template', () => {
            class Child extends Element {
                setFoo() {
                    this.setAttribute('foo', 'bar');
                }
            }
            Child.publicMethods = ['setFoo'];

            class Parent extends Element {
                render() {
                    return ($api) => {
                        return [$api.c('x-child', Child, {})]
                    }
                }
            }
            const element = createElement('should-set-attribute-on-host-element-when-element-is-nested-in-template', { is: Parent });
            document.body.appendChild(element);
            const child = querySelector.call(element, 'x-child');
            child.setFoo();
            expect(child.hasAttribute('foo')).toBe(true);
            expect(child.getAttribute('foo')).toBe('bar');
        });

        it('should set attribute on host element', () => {
            class MyComponent extends Element {
                setFoo() {
                    this.setAttribute('foo', 'bar');
                }
            }
            MyComponent.publicMethods = ['setFoo'];
            const element = createElement('should-set-attribute-on-host-element', { is: MyComponent });
            element.setFoo();
            expect(element.hasAttribute('foo')).toBe(true);
            expect(element.getAttribute('foo')).toBe('bar');
        });

        it('should throw an error if attempting to call setAttribute during construction', () => {
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.setAttribute('foo', 'bar');
                    }).toThrowError("Assert Violation: Failed to construct '<throw-during-construction>': The result must not have attributes.");
                }
            }
            createElement('throw-during-construction', { is: MyComponent });
        });
    });

    describe('#removeAttributeNS()', () => {
        it('should remove namespaced attribute on host element when element is nested in template', () => {
            class Child extends Element {
                removeTitle() {
                    this.removeAttributeNS('x', 'title');
                }
            }
            Child.publicMethods = ['removeTitle'];

            class Parent extends Element {
                render() {
                    return ($api) => {
                        return [$api.c('x-child', Child, {
                            attrs: {
                                'x:title': 'foo',
                            }
                        })]
                    }
                }
            }
            const element = createElement('remove-namespaced-attribute-on-host-element', { is: Parent });
            document.body.appendChild(element);
            const child = querySelector.call(element, 'x-child');
            child.removeTitle();
            expect(child.hasAttributeNS('x', 'title')).toBe(false);
        });

        it('should remove attribute on host element', () => {
            class MyComponent extends Element {
                removeTitle() {
                    this.removeAttributeNS('x', 'title');
                }
            }
            MyComponent.publicMethods = ['removeTitle'];
            const element = createElement('x-foo', { is: MyComponent });
            element.setAttributeNS('x', 'title', 'foo');
            element.removeTitle();
            expect(element.hasAttributeNS('x', 'title')).toBe(false);
        });
    });

    describe('#removeAttribute()', () => {
        it('should remove attribute on host element when element is nested in template', () => {
            class Child extends Element {
                removeTitle() {
                    this.removeAttribute('title');
                }
            }
            Child.publicMethods = ['removeTitle'];

            class Parent extends Element {
                render() {
                    return ($api) => {
                        return [$api.c('x-child', Child, {
                            attrs: {
                                title: 'foo',
                            }
                        })]
                    }
                }
            }
            const element = createElement('element-is-nested-in-template', { is: Parent });
            document.body.appendChild(element);
            const child = querySelector.call(element, 'x-child');
            child.removeTitle();
            expect(child.hasAttribute('title')).toBe(false);
        });

        it('should remove attribute on host element', () => {
            class MyComponent extends Element {
                removeTitle() {
                    this.removeAttribute('title');
                }
            }
            MyComponent.publicMethods = ['removeTitle'];
            const element = createElement('should-remove-attribute-on-host-element', { is: MyComponent });
            element.title = 'foo';
            element.removeTitle();
            expect(element.hasAttribute('title')).toBe(false);
        });
    });

    describe('#getBoundingClientRect()', () => {
        it('should throw during construction', () => {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.getBoundingClientRect();
                    }).toThrow();
                }
            };
            createElement('getBoundingClientRect-should-throw-during-construction', { is: def });
            expect.assertions(1);
        });
    });

    describe('#classList()', () => {
        it('should throw when adding classList during construction', () => {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                }
            };
            expect(() => createElement('classList-throw-when-adding-classList-during-construction', { is: def })).toThrow();
        });

        it('should have a valid classList during connectedCallback', () => {
            expect.assertions(2);
            const def = class MyComponent extends Element {
                connectedCallback() {
                    this.classList.add('foo');
                    expect(this.classList.contains('foo')).toBe(true);
                }
            };
            const elm = createElement('classList-valid-classList-during-connectedCallback', { is: def });
            document.body.appendChild(elm);
            expect(elm.classList.contains('foo')).toBe(true);
        });
    });

    describe('#getAttributeNS()', () => {
        it('should return correct attribute value', () => {
            class MyComponent extends Element {
                getXTitle() {
                    return this.getAttributeNS('x', 'title');
                }
            }
            MyComponent.publicMethods = ['getXTitle'];
            const elm = createElement('getAttributeNS-correct-attribute-value', { is: MyComponent });
            elm.setAttributeNS('x', 'title', 'foo');
            expect(elm.getXTitle()).toBe('foo');
        });
    });

    describe('#getAttribute()', () => {
        it('should throw when no attribute name is provided', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => this.getAttribute()).toThrow();
                }
            };
            createElement('getAttribute-throw-when-no-attribute-name-is-provided', { is: def });
        });
        it('should not throw when attribute name matches a declared public property', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => this.getAttribute('foo')).not.toThrow();
                }
            };
            def.publicProps = { foo: "default value" };
            createElement('x-foo', { is: def });
        });
        it('should be null for non-valid attribute names', () => {
            expect.assertions(3);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(this.getAttribute(null)).toBeNull();
                    expect(this.getAttribute(undefined)).toBeNull();
                    expect(this.getAttribute("")).toBeNull();
                }
            };
            createElement('x-foo', { is: def });
        });
        it('should be null for non-existing attributes', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(this.getAttribute("foo-bar-baz")).toBeNull();
                }
            };
            createElement('x-foo', { is: def });
        });

    });

    describe('#dispatchEvent', function() {
        it('should throw when event is dispatched during construction', function() {
            expect.assertions(1);
            class Foo extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.dispatchEvent(new CustomEvent('constructorevent'));
                    }).toThrow('this.dispatchEvent() should not be called during the construction of the custom element for <x-foo> because no one is listening for the event "constructorevent" just yet.');
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
        });

        it('should log warning when element is not connected', function() {
            class Foo extends Element {}
            const elm = createElement('x-foo', { is: Foo });
            jest.spyOn(assertLogger, 'logWarning');

            return Promise.resolve().then(() => {
                elm[ViewModelReflection].component.dispatchEvent(new CustomEvent('warning'));
                expect(assertLogger.logWarning).toBeCalledWith('Unreachable event "warning" dispatched from disconnected element <x-foo>. Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback).');
                assertLogger.logWarning.mockRestore();
            });
        });

        it('should not log warning when element is connected', function() {
            class Foo extends Element {}
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            jest.spyOn(assertLogger, 'logWarning');

            return Promise.resolve().then(() => {
                elm[ViewModelReflection].component.dispatchEvent(new CustomEvent('warning'));
                expect(assertLogger.logWarning).not.toBeCalled();
                assertLogger.logWarning.mockRestore();
            });
        });

        it('should log warning when event name contains non-alphanumeric lowercase characters', function() {
            class Foo extends Element {}
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            jest.spyOn(assertLogger, 'logWarning');

            return Promise.resolve().then(() => {
                elm[ViewModelReflection].component.dispatchEvent(new CustomEvent('foo1-$'));
                expect(assertLogger.logWarning).toBeCalled();
                assertLogger.logWarning.mockRestore();
            });
        });

        it('should log warning when event name does not start with alphabetic lowercase characters', function() {
            class Foo extends Element {}
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            jest.spyOn(assertLogger, 'logWarning');
            return Promise.resolve().then( () => {
                elm[ViewModelReflection].component.dispatchEvent(new CustomEvent('123'));
                expect(assertLogger.logWarning).toBeCalled();
                assertLogger.logWarning.mockRestore();
            });
        });

        it('should not log warning for alphanumeric lowercase event name', function() {
            class Foo extends Element {}
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            jest.spyOn(assertLogger, 'logWarning');
            return Promise.resolve().then( () => {
                elm[ViewModelReflection].component.dispatchEvent(new CustomEvent('foo1234abc'));
                expect(assertLogger.logWarning).not.toBeCalled();
                assertLogger.logWarning.mockRestore();
            });
        });

        it('should get native click event in host', function () {
            expect.assertions(3);
            function html($api) {
                return [$api.h('div', { key: 1 }, [])];
            };
            let elm;
            class Foo extends Element {
                constructor() {
                    super();
                    this.template.addEventListener('click', (e) => {
                        expect(e.composed).toBe(true);
                        expect(e.target).toBe(this.template.querySelector('div')); // notice that target is visible for the root, always
                        expect(unwrap(e.currentTarget)).toBe(elm); // notice that currentTarget is host element instead of root since root is just an illusion for now.
                    });
                }
                render() {
                    return html;
                }
                run() {
                    this.template.querySelector('div').click();
                }
            }
            Foo.publicMethods = ['run'];
            elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            elm.run();
        });

        it('should get native events from template', function () {
            expect.assertions(2);
            function html($api, $cmp) {
                return [$api.h('div', { key: 1, on: { click: $api.b($cmp.handleClick)} }, [])];
            }
            class Foo extends Element {
                handleClick(e: Event) {
                    expect(e.target).toBe(this.template.querySelector('div'));
                    expect(e.currentTarget).toBe(this.template.querySelector('div'));
                }
                render() {
                    return html;
                }
                run() {
                    this.template.querySelector('div').click();
                }
            }
            Foo.publicMethods = ['run'];
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            elm.run();
        });

        it('should get custom events in root when marked as bubbles=true', function () {
            expect.assertions(6);
            function html($api) {
                return [$api.h('div', { key: 1 }, [])];
            }
            let elm;
            class Foo extends Element {
                constructor() {
                    super();
                    this.template.addEventListener('xyz', (e) => {
                        expect(e.bubbles).toBe(true);
                        expect(e.target).toBe(this.template.querySelector('div')); // notice that target is host element
                        expect(unwrap(e.currentTarget)).toBe(elm); // notice that currentTarget is host element
                    });
                }
                render() {
                    return html;
                }
                run() {
                    this.template.querySelector('div').dispatchEvent(new CustomEvent('xyz'));
                    this.template.querySelector('div').dispatchEvent(new CustomEvent('xyz', {
                        bubbles: true,
                        composed: true,
                    }));
                    this.template.querySelector('div').dispatchEvent(new CustomEvent('xyz', {
                        bubbles: true,
                        composed: false,
                    }));
                }
            }
            Foo.publicMethods = ['run'];
            elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            elm.run();
        });

        it('should listen for custom events declare in template', function () {
            expect.assertions(6);
            function html($api, $cmp) {
                return [$api.h('div', { key: 1, on: { xyz: $api.b($cmp.handleXyz)} }, [])];
            }
            class Foo extends Element {
                handleXyz(e: Event) {
                    expect(e.target).toBe(this.template.querySelector('div'));
                    expect(e.currentTarget).toBe(this.template.querySelector('div'));
                }
                render() {
                    return html;
                }
                run() {
                    this.template.querySelector('div').dispatchEvent(new CustomEvent('xyz'));
                    this.template.querySelector('div').dispatchEvent(new CustomEvent('xyz', {
                        bubbles: true,
                        composed: true,
                    }));
                    this.template.querySelector('div').dispatchEvent(new CustomEvent('xyz', {
                        bubbles: true,
                        composed: false,
                    }));
                }
            }
            Foo.publicMethods = ['run'];
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            elm.run();
        });
    });

    describe('#tagName', () => {
        it('should have a valid value during construction', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(this.tagName).toBe('X-FOO');
                }
            };
            createElement('x-foo', { is: def });
        });
    });

    describe('#tracked', () => {
        it('should not warn if component has untracked state property', function() {
            jest.spyOn(assertLogger, 'logWarning');
            class MyComponent extends Element {
                state = {};
            }
            const element = createElement('x-foo', { is: MyComponent });
            expect(assertLogger.logWarning).not.toHaveBeenCalled();
            assertLogger.logWarning.mockRestore();
        });
        it('should not warn if component has tracked state property', function() {
            jest.spyOn(assertLogger, 'logWarning');
            class MyComponent extends Element {
                state = {};
            }
            MyComponent.track = { state: 1 };
            const element = createElement('x-foo-tracked-state', { is: MyComponent });
            expect(assertLogger.logWarning).not.toHaveBeenCalled();
            assertLogger.logWarning.mockRestore();
        });
        it('should be mutable during construction', () => {
            let state;
            const o = { foo: 1, bar: 2, baz: 1 };
            const def = class MyComponent extends Element {
                state = {
                    foo: undefined,
                    bar: undefined,
                    baz: undefined,
                };
                constructor() {
                    super();
                    this.state = o;
                    this.state.baz = 3;
                    state = this.state;
                }
            };
            def.track = { state: 1 };
            createElement('x-foo', { is: def });
            expect(state.foo).toBe(1);
            expect(state.bar).toBe(2);
            expect(state.baz).toBe(3);
            expect(o.foo).toBe(1);
            expect(o.bar).toBe(2);
            expect(o.baz).toBe(3);
            expect(o).not.toBe(state);
        });
        it('should accept member properties', () => {
            let state;
            const o = { foo: 1 };
            const def = class MyComponent extends Element {
                state = { x: 1, y: o };
                constructor() {
                    super();
                    state = this.state;
                }
            };
            def.track = { state: 1 };
            createElement('x-foo', { is: def });
            expect({ x: 1, y: o }).toEqual(state);
            expect(state.y).not.toBe(o);
        });
        it('should not throw an error when assigning observable object', function() {
            expect.assertions(1);
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.state = {};
                    }).not.toThrow();
                }
            }
            MyComponent.track = { state: 1 };
            createElement('x-foo', { is: MyComponent });
        });
    });

    describe('global HTML Properties', () => {
        it('should always return null', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(this.getAttribute('title')).toBeNull();
                }
            };
            createElement('x-foo', { is: def }).setAttribute('title', 'cubano');
        });

        it('should set user specified value during setAttribute call', () => {
            let userDefinedTabIndexValue = -1;
            class MyComponent extends Element {
                renderedCallback() {
                    userDefinedTabIndexValue = this.getAttribute("tabindex");
                }
            }
            const elm = createElement('x-foo', {is: MyComponent});
            elm.setAttribute('tabindex', '0');
            document.body.appendChild(elm);

            return Promise.resolve().then( () => {
                expect(userDefinedTabIndexValue).toBe('0');
            });

        }),

        it('should log console error when user land code changes attribute via querySelector', () => {
            jest.spyOn(assertLogger, 'logError');
            function html($api, $cmp) {
                return [
                    $api.c('x-child', Child, { attrs: { title: 'child title' }})
                ];
            }
            class Parent extends Element {
                render() {
                    return html;
                }
            }
            class Child extends Element {}
            const parentElm = createElement('x-parent', { is: Parent });
            document.body.appendChild(parentElm);

            return Promise.resolve().then( () => {
                const childElm = querySelector.call(parentElm, 'x-child');
                childElm.setAttribute('title', "value from parent");
                expect(assertLogger.logError).toBeCalled();
                assertLogger.logError.mockRestore();
            });
        });

        it('should log console error when user land code removes attribute via querySelector', () => {
            jest.spyOn(assertLogger, 'logError');
            function html($api, $cmp) {
                return [
                    $api.c('x-child', Child, { attrs: { title: 'child title' }})
                ];
            }
            class Parent extends Element {
                render() {
                    return html;
                }
            }
            class Child extends Element {}
            const parentElm = createElement('x-parent', { is: Parent });
            document.body.appendChild(parentElm);

            return Promise.resolve().then( () => {
                const childElm = querySelector.call(parentElm, 'x-child');
                childElm.removeAttribute('title');
                expect(assertLogger.logError).toBeCalled();
                assertLogger.logError.mockRestore();
            });
        });

        it('should log error message when attribute is set via elm.setAttribute if reflective property is defined', () => {
            jest.spyOn(assertLogger, 'logError');
            class MyComponent extends Element {}
            const elm = createElement('x-foo', {is: MyComponent});
            elm.setAttribute('tabindex', '0');
            document.body.appendChild(elm);

            return Promise.resolve().then( () => {
                expect(assertLogger.logError).toBeCalled();
                assertLogger.logError.mockRestore();
            });
        });

        it('should delete existing attribute prior rendering', () => {
            const def = class MyComponent extends Element {};
            const elm = createElement('x-foo', { is: def });
            elm.setAttribute('title', 'parent title');
            elm.removeAttribute('title');
            document.body.appendChild(elm);

            return Promise.resolve().then( () => {
                expect(elm.getAttribute('title')).not.toBe('parent title');
            });
        }),

        it('should correctly set child attribute ', () => {
            let childTitle = null;
            function html($api, $cmp) {
                return [
                    $api.c('x-child', Child, { attrs: { title: 'child title' }})
                ];
            }
            class Parent extends Element {
                render() {
                    return html;
                }
            }

            class Child extends Element {
                renderedCallback() {
                    childTitle = this.getAttribute('title');
                }
            }

            const parentElm = createElement('x-parent', { is: Parent });
            parentElm.setAttribute('title', 'parent title');
            document.body.appendChild(parentElm);

            return Promise.resolve().then( () => {
                const childElm = querySelector.call(parentElm, 'x-child');
                expect(childElm.getAttribute('title')).toBe('child title');
            });
        });
    });

    describe('#toString()', () => {
        it('should produce a nice tag', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(this.toString()).toBe('<x-foo>');
                }
            };
            createElement('x-foo', { is: def });
        });
    });

    describe('#data layer', () => {
        it('should allow custom instance getter and setter', () => {
            let a, ctx;
            class MyComponent extends Element  {}
            MyComponent.publicProps = { foo: true };
            const elm = createElement('x-foo', { is: MyComponent });
            elm.foo = 1;
            document.body.appendChild(elm);
            Object.defineProperty(elm[ViewModelReflection].component, 'foo', {
                set(value) {
                    ctx = this;
                    a = value;
                }
            });
            elm.foo = 2;
            expect(a).toBe(2);
            expect(elm[ViewModelReflection].component).toBe(ctx);
        });
    });

    describe('#tabIndex', function() {
        it('should have a valid value during connectedCallback', function() {
            expect.assertions(1);

            class MyComponent extends Element {
                connectedCallback() {
                    expect(this.tabIndex).toBe(3);
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            elm.setAttribute('tabindex', 3);
            document.body.appendChild(elm);
        });

        it('should have a valid value after initial render', function() {
            class MyComponent extends Element {}

            const elm = createElement('x-foo', { is: MyComponent });
            elm.setAttribute('tabindex', 3);
            document.body.appendChild(elm);

            expect(elm[ViewModelReflection].component.tabIndex).toBe(3);
        });

        it('should set tabindex correctly', function() {
            class MyComponent extends Element {
                connectedCallback() {
                    this.tabIndex = 2;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            elm.setAttribute('tabindex', 3);
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                expect(elm.tabIndex).toBe(2);
                expect(elm[ViewModelReflection].component.tabIndex).toBe(2);
            });
        });

        it('should not trigger render cycle', function() {
            let callCount = 0;
            class MyComponent extends Element {
                connectedCallback() {
                    this.tabIndex = 2;
                }
                render() {
                    callCount += 1;
                    return () => [];
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            elm.setAttribute('tabindex', 3);
            document.body.appendChild(elm);

            return Promise.resolve().then(() => {
                expect(callCount).toBe(1);
            });
        });

        it('should allow parent component to overwrite internally set tabIndex', function() {
            class MyComponent extends Element {
                connectedCallback() {
                    this.tabIndex = 2;
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            elm.setAttribute('tabindex', 3);
            document.body.appendChild(elm);
            elm.setAttribute('tabindex', 4);

            return Promise.resolve().then(() => {
                expect(elm.tabIndex).toBe(4);
                expect(elm[ViewModelReflection].component.tabIndex).toBe(4);
            });
        });

        it('should throw if setting tabIndex during render', function() {
            expect.assertions(1);
            class MyComponent extends Element {
                render() {
                    expect(() => {
                        this.tabIndex = 2;
                    }).toThrow();
                    return () => [];
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
        });

        it('should throw if setting tabIndex during construction', function() {
            expect.assertions(1);
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.tabIndex = 2;
                    }).toThrow();
                }
            }
            createElement('x-foo', { is: MyComponent });
        });
    });

    describe('life-cycles', function() {
        it('should guarantee that the element is rendered when inserted in the DOM', function() {
            let rendered = 0;
            class MyComponent extends Element {
                render() {
                    rendered++;
                    return () => [];
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(rendered).toBe(0);
            document.body.appendChild(elm);
            expect(rendered).toBe(1);
        });

        it('should guarantee that the connectedCallback is invoked sync after the element is inserted in the DOM', function() {
            let called = 0;
            class MyComponent extends Element {
                render() {
                    return () => [];
                }
                connectedCallback() {
                    called++;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(called).toBe(0);
            document.body.appendChild(elm);
            expect(called).toBe(1);
        });

        it('should guarantee that the connectedCallback is invoked before render after the element is inserted in the DOM', function() {
            const ops: string[] = [];
            class MyComponent extends Element {
                render() {
                    ops.push('render');
                    return () => [];
                }
                connectedCallback() {
                    ops.push('connected');
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(ops).toEqual(['connected', 'render']);
        });

        it('should guarantee that the disconnectedCallback is invoked sync after the element is removed from the DOM', function() {
            let called = 0;
            class MyComponent extends Element {
                render() {
                    return () => [];
                }
                disconnectedCallback() {
                    called++;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(called).toBe(0);
            document.body.removeChild(elm);
            expect(called).toBe(1);
        });

        it('should not render even if there is a mutation if the element is not in the DOM yet', function() {
            let rendered = 0;
            class MyComponent extends Element {
                render() {
                    rendered++;
                    this.x; // reactive
                    return () => [];
                }
            }
            MyComponent.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: MyComponent });
            elm.x = 2;
            return Promise.resolve().then(() => {
                expect(rendered).toBe(0);
            });
        });

        it('should not render if the element was removed from the DOM', function() {
            let rendered = 0;
            class MyComponent extends Element {
                render() {
                    rendered++;
                    this.x; // reactive
                    return () => [];
                }
            }
            MyComponent.publicProps = { x: 1 };
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            document.body.removeChild(elm);
            expect(rendered).toBe(1);
            elm.x = 2;
            return Promise.resolve().then(() => {
                expect(rendered).toBe(1);
            });
        });

        it('should observe moving the element thru the DOM tree', function() {
            let rendered = 0;
            let connected = 0;
            let disconnected = 0;
            class MyComponent extends Element {
                render() {
                    rendered++;
                    return () => [];
                }
                connectedCallback() {
                    connected++;
                }
                disconnectedCallback() {
                    disconnected++;
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(rendered).toBe(0);
            document.body.appendChild(elm);
            expect(rendered).toBe(1);
            const div = document.createElement('div');
            document.body.appendChild(div);
            div.appendChild(elm);
            expect(rendered).toBe(2);
            expect(connected).toBe(2);
            expect(disconnected).toBe(1);
        });

        it('should not throw error when accessing a non-observable property from tracked property when not rendering', function() {
            class MyComponent extends Element {
                state = {};
                set foo(value) {
                    this.state.foo = value;
                }
                get foo() {
                    return this.state.foo;
                }
            }

            MyComponent.publicProps = {
                foo: {
                    config: 3
                }
            };

            MyComponent.track = { state: 1 };

            const elm = createElement('x-foo', { is: MyComponent });
            elm.foo = new Map();
            expect(() => {
                elm.foo;
            }).not.toThrow();
        });

        it('should not log a warning when setting tracked value to null', function() {
            jest.spyOn(assertLogger, 'logWarning');
            class MyComponent extends Element {
                state = {};
                connectedCallback() {
                    this.state.foo = null;
                    this.state.foo;
                }
            }
            MyComponent.track = { state: 1 };
            const elm = createElement('x-foo-tracked-null', { is: MyComponent });
            document.body.appendChild(elm);
            expect(assertLogger.logWarning).not.toBeCalled();
            assertLogger.logWarning.mockRestore();
        });

        it('should not log a warning when initializing api value to null', function() {
            jest.spyOn(assertLogger, 'logWarning');
            class MyComponent extends Element {
                foo = null;
            }
            MyComponent.publicProps = {
                foo: {
                    config: 0
                }
            };
            const elm = createElement('x-foo-init-api', { is: MyComponent });
            document.body.appendChild(elm);
            expect(assertLogger.logWarning).not.toBeCalled();
            assertLogger.logWarning.mockRestore();
        });
    });

    describe('Inheritance', () => {
        it('should inherit public getters and setters correctly', () => {
            class MyParent extends Element {
                get foo() {}
                set foo(value) {}
            }
            MyParent.publicProps = {
                foo: {
                    config: 3,
                }
            }
            class MyComponent extends MyParent {

            }
            expect(() => {
                createElement('getter-inheritance', { is: MyComponent })
            }).not.toThrow();
        });

        it('should call correct inherited public setter', () => {
            let count = 0;
            class MyParent extends Element {
                get foo() {}
                set foo(value) {
                    count += 1;
                }
            }
            MyParent.publicProps = {
                foo: {
                    config: 3,
                }
            }
            class MyComponent extends MyParent {

            }

            const elm = createElement('getter-inheritance', { is: MyComponent });
            elm.foo = 'bar';
            expect(count).toBe(1);
        });
    });

    describe('Aria Properties', () => {
        describe('#role', () => {
            it('should reflect attribute by default', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-reflect-aria-role', { is: MyComponent });
                element.role = 'tab';
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'role')).toBe('tab');
            });

            it('should return correct value from getter', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                element.role = 'tab';
                expect(element.role).toBe('tab');
            });

            it('should return correct value when nothing has been set', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                expect(element.role).toBe(null);
            });

            it('should return null even if the shadow root value is set', () => {
                class MyComponent extends Element {
                    connectedCallback() {
                        this.template.role = 'tab';
                    }
                }
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                document.body.appendChild(element);
                expect(element.role).toBe(null);
                // checking for the internal polyfill value as well
                expect(HTMLElement.prototype.getAttribute.call(element, 'role')).toBe('tab');
            });

            it('should call setter when defined', () => {
                let called = 0;
                class MyComponent extends Element {
                    get role() {}
                    set role(value) {
                        called += 1;
                    }
                }
                MyComponent.publicProps = {
                    role: {
                        config: 3,
                    }
                }
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                document.body.appendChild(element);
                element.role = 'tab';
                expect(called).toBe(1);
            });

            it('should not overwrite role attribute when setter does nothing', () => {
                class MyComponent extends Element {
                    connectedCallback() {
                        this.template.role = 'tab';
                    }
                    get role() {}
                    set role(value) {}
                }
                MyComponent.publicProps = {
                    role: {
                        config: 3,
                    }
                }
                const element = createElement('prop-getter-aria-role', { is: MyComponent });
                document.body.appendChild(element);
                element.role = 'nottab';
                expect(HTMLElement.prototype.getAttribute.call(element, 'role')).toBe('tab');
            });

            it('should reflect role from root when element value is set to null', () => {
                class MyComponent extends Element {
                    connectedCallback() {
                        this.template.role = 'tab';
                    }
                }
                const element = createElement('prop-getter-null-aria-role', { is: MyComponent });
                document.body.appendChild(element);
                element.role = 'nottab';
                return Promise.resolve().then(() => {
                    element.role = null;
                    return Promise.resolve().then(() => {
                        expect(HTMLElement.prototype.getAttribute.call(element, 'role')).toBe('tab');
                    });
                });
            });

            it('should remove role attribute from element when root and value is null', () => {
                class MyComponent extends Element {
                    connectedCallback() {
                        this.template.role = 'tab';
                    }
                    clearRole() {
                        this.template.role = null;
                    }
                }
                MyComponent.publicMethods = ['clearRole'];
                const element = createElement('prop-getter-null-aria-role', { is: MyComponent });
                document.body.appendChild(element);
                //element.role = 'nottab';
                return Promise.resolve().then(() => {
                    element.role = null;
                    element.clearRole();
                    return Promise.resolve().then(() => {
                        expect(HTMLElement.prototype.hasAttribute.call(element, 'role')).toBe(false);
                    });
                });
            });

            describe('AOM shim', () => {
                it('getAttribute reflect default value when aria-checked has been removed', () => {
                    class MyComponent extends Element {
                        connectedCallback() {
                            this.template.role = 'tab'
                        }
                    }
                    const element = createElement('prop-get-attribute-null-aria-checked', { is: MyComponent });
                    document.body.appendChild(element);
                    element.setAttribute('role', 'button');
                    element.removeAttribute('role');
                    expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'role')).toBe('tab');
                });
            });
        });

        describe('#ariaChecked', () => {
            it('should reflect attribute by default', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-reflect-aria-checked', { is: MyComponent });
                element.ariaChecked = 'true';
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'aria-checked')).toBe('true');
            });

            it('should return correct value from getter', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-aria-checked', { is: MyComponent });
                element.ariaChecked = 'true';
                expect(element.ariaChecked).toBe('true');
            });

            it('should return correct value when nothing has been set', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-aria-checked', { is: MyComponent });
                expect(element.ariaChecked).toBe(null);
            });

            it('should return null even if the shadow root value is set', () => {
                class MyComponent extends Element {
                    connectedCallback() {
                        this.template.ariaChecked = 'true';
                    }
                }
                const element = createElement('prop-getter-aria-checked', { is: MyComponent });
                document.body.appendChild(element);
                expect(element.ariaChecked).toBe(null);
                // checking for the internal polyfill value as well
                expect(HTMLElement.prototype.getAttribute.call(element, 'aria-checked')).toBe('true');
            });

            describe('AOM shim', () => {
                it('internal getAttribute reflect default value when aria-checked has been removed', () => {
                    class MyComponent extends Element {
                        connectedCallback() {
                            this.template.ariaChecked = 'true';
                            this.setAttribute('aria-checked', 'false');
                            this.removeAttribute('aria-checked');
                        }
                    }
                    const element = createElement('prop-get-attribute-null-aria-checked', { is: MyComponent });
                    document.body.appendChild(element);
                    expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'aria-checked')).toBe('true');
                });

                it('external getAttribute reflect default value when aria-checked has been removed', () => {
                    class MyComponent extends Element {
                        connectedCallback() {
                            this.template.ariaChecked = 'true'
                        }
                    }
                    const element = createElement('prop-get-attribute-null-aria-checked', { is: MyComponent });
                    document.body.appendChild(element);
                    element.setAttribute('aria-checked', 'false');
                    element.removeAttribute('aria-checked');
                    expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'aria-checked')).toBe('true');
                });
            });
        });

        describe('#ariaLabel', () => {
            it('should reflect attribute by default', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-reflect-aria-label', { is: MyComponent });
                element.ariaLabel = 'label';
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'aria-label')).toBe('label');
            });

            it('should return correct value from getter', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-aria-label', { is: MyComponent });
                element.ariaLabel = 'label';
                expect(element.ariaLabel).toBe('label');
            });

            it('should return correct value when nothing has been set', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-aria-label', { is: MyComponent });
                expect(element.ariaLabel).toBe(null);
            });

            it('should return null value when not value is set, shadow root value should not leak out', () => {
                class MyComponent extends Element {
                    connectedCallback() {
                        this.template.ariaLabel = 'foo';
                    }
                }
                const element = createElement('prop-getter-aria-label', { is: MyComponent });
                document.body.appendChild(element);
                expect(element.ariaLabel).toBe(null);
                // checking for the internal polyfill value as well
                expect(HTMLElement.prototype.getAttribute.call(element, 'aria-label')).toBe('foo');
            });
        });
    });

    describe('global HTML Properties', () => {
        describe('#lang', () => {
            it('should reflect attribute by default', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-reflect-lang', { is: MyComponent });
                element.lang = 'en';
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'lang')).toBe('en');
            });

            it('should return correct value from getter', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-lang', { is: MyComponent });
                element.lang = 'en';
                expect(element.lang).toBe('en');
            });

            it('should call setter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    set lang(value) {
                        count += 1;
                    }
                    get lang() {}
                }
                MyComponent.publicProps = {
                    lang: {
                        config: 3,
                    }
                }
                const element = createElement('prop-setter-lang', { is: MyComponent });
                element.lang = {},
                expect(count).toBe(1);
            });

            it('should not be reactive when defining own setter', () => {
                let count = 0;
                class MyComponent extends Element {
                    set lang(value) {

                    }

                    render() {
                        count += 1;
                        return ($api, $cmp) => {
                            return [$api.h('div', {
                                key: 0,
                                props: {
                                    title: $cmp.lang
                                }
                            }, [])];
                        }
                    }
                }
                const element = createElement('prop-setter-lang-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.lang = 'en';
                return Promise.resolve()
                    .then(() => {
                        expect(count).toBe(1);
                    });
            });

            it('should call getter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    get lang() {
                        count += 1;
                        return 'en';
                    }
                }
                MyComponent.publicProps = {
                    lang: {
                        config: 1,
                    }
                }
                const element = createElement('prop-getter-lang-imperative', { is: MyComponent });
                expect(element.lang).toBe('en');
                expect(count).toBe(1);
            });

            it('should be reactive by default', () => {
                let renderCount = 0;
                class MyComponent extends Element {
                    render() {
                        return ($api, $cmp) => {
                            renderCount += 1;
                            return [
                                $api.h('div', {
                                    key: 0,
                                    props: {
                                        id: $cmp.lang
                                    }
                                }, [])
                            ];
                        }
                    }
                }
                const element = createElement('prop-lang-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.lang = 'en';
                return Promise.resolve()
                    .then(() => {
                        expect(renderCount).toBe(2);
                        expect(querySelector.call(element, 'div')!.id).toBe('en');
                    });
            });

            it('should throw an error when setting default value in constructor', () => {
                class MyComponent extends Element {
                    constructor() {
                        super();
                        this.lang = 'en';
                    }
                }
                expect(() => {
                    createElement('x-foo', { is: MyComponent });
                }).toThrowError("Failed to construct '<x-foo>': The result must not have attributes.");

            });
        });

        describe('#hidden', () => {
            it('should reflect attribute by default', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-reflect-hidden', { is: MyComponent });
                element.hidden = true;
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'hidden')).toBe('');
            });

            it('should return correct value from getter', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-hidden', { is: MyComponent });
                element.hidden = true;
                expect(element.hidden).toBe(true);
            });

            it('should call setter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    set hidden(value) {
                        count += 1;
                    }
                    get hidden() {}
                }
                MyComponent.publicProps = {
                    hidden: {
                        config: 3,
                    }
                }
                const element = createElement('prop-setter-hidden', { is: MyComponent });
                element.hidden = {},
                expect(count).toBe(1);
            });

            it('should not be reactive when defining own setter', () => {
                let count = 0;
                class MyComponent extends Element {
                    set hidden(value) {

                    }

                    render() {
                        count += 1;
                        return ($api, $cmp) => {
                            return [$api.h('div', {
                                key: 0,
                                props: {
                                    title: $cmp.hidden
                                }
                            }, [])];
                        }
                    }
                }
                const element = createElement('prop-setter-hidden-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.hidden = true;
                return Promise.resolve()
                    .then(() => {
                        expect(count).toBe(1);
                    });
            });

            it('should call getter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    get hidden() {
                        count += 1;
                        return 'hidden';
                    }
                }
                MyComponent.publicProps = {
                    hidden: {
                        config: 1,
                    }
                }
                const element = createElement('prop-getter-hidden-imperative', { is: MyComponent });
                expect(element.hidden).toBe('hidden');
                expect(count).toBe(1);
            });

            it('should be reactive by default', () => {
                let renderCount = 0;
                class MyComponent extends Element {
                    render() {
                        return ($api, $cmp) => {
                            renderCount += 1;
                            return [
                                $api.h('div', {
                                    key: 0,
                                    props: {
                                        id: $cmp.hidden
                                    }
                                }, [])
                            ];
                        }
                    }
                }
                const element = createElement('prop-hidden-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.hidden = true;
                return Promise.resolve()
                    .then(() => {
                        expect(renderCount).toBe(2);
                        expect(querySelector.call(element, 'div')!.id).toBe('true');
                    });
            });

            it('should throw an error when setting default value in constructor', () => {
                class MyComponent extends Element {
                    constructor() {
                        super();
                        this.hidden = true;
                    }
                }
                expect(() => {
                    createElement('x-foo', { is: MyComponent });
                }).toThrowError("Failed to construct '<x-foo>': The result must not have attributes.");

            });
        });

        describe('#dir', () => {
            it('should reflect attribute by default', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-reflect-dir', { is: MyComponent });
                element.dir = 'ltr';
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'dir')).toBe('ltr');
            });

            it('should return correct value from getter', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-dir', { is: MyComponent });
                element.dir = 'ltr';
                expect(element.dir).toBe('ltr');
            });

            it('should call setter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    set dir(value) {
                        count += 1;
                    }
                    get dir() {}
                }
                MyComponent.publicProps = {
                    dir: {
                        config: 3,
                    }
                }
                const element = createElement('prop-setter-dir', { is: MyComponent });
                element.dir = {},
                expect(count).toBe(1);
            });

            it('should not be reactive when defining own setter', () => {
                let count = 0;
                class MyComponent extends Element {
                    set dir(value) {

                    }

                    render() {
                        count += 1;
                        return ($api, $cmp) => {
                            return [$api.h('div', {
                                key: 0,
                                props: {
                                    title: $cmp.dir
                                }
                            }, [])];
                        }
                    }
                }
                const element = createElement('prop-setter-dir-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.dir = 'ltr';
                return Promise.resolve()
                    .then(() => {
                        expect(count).toBe(1);
                    });
            });

            it('should call getter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    get dir() {
                        count += 1;
                        return 'ltr';
                    }
                }
                MyComponent.publicProps = {
                    dir: {
                        config: 1,
                    }
                }
                const element = createElement('prop-getter-dir-imperative', { is: MyComponent });
                expect(element.dir).toBe('ltr');
                expect(count).toBe(1);
            });

            it('should be reactive by default', () => {
                let renderCount = 0;
                class MyComponent extends Element {
                    render() {
                        return ($api, $cmp) => {
                            renderCount += 1;
                            return [
                                $api.h('div', {
                                    key: 0,
                                    props: {
                                        id: $cmp.dir
                                    }
                                }, [])
                            ];
                        }
                    }
                }
                const element = createElement('prop-dir-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.dir = 'ltr';
                return Promise.resolve()
                    .then(() => {
                        expect(renderCount).toBe(2);
                        expect(querySelector.call(element, 'div')!.id).toBe('ltr');
                    });
            });

            it('should throw an error when setting default value in constructor', () => {
                class MyComponent extends Element {
                    constructor() {
                        super();
                        this.dir = 'ltr';
                    }
                }
                expect(() => {
                    createElement('x-foo', { is: MyComponent });
                }).toThrowError("Failed to construct '<x-foo>': The result must not have attributes.");

            });
        });

        describe('#id', () => {
            it('should reflect attribute by default', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-reflect-id', { is: MyComponent });
                element.id = 'id';
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'id')).toBe('id');
            });

            it('should return correct value from getter', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-id', { is: MyComponent });
                element.id = 'id';
                expect(element.id).toBe('id');
            });

            it('should call setter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    set id(value) {
                        count += 1;
                    }
                    get id() {}
                }
                MyComponent.publicProps = {
                    id: {
                        config: 3,
                    }
                }
                const element = createElement('prop-setter-id', { is: MyComponent });
                element.id = {},
                expect(count).toBe(1);
            });

            it('should not be reactive when defining own setter', () => {
                let count = 0;
                class MyComponent extends Element {
                    set id(value) {

                    }

                    render() {
                        count += 1;
                        return ($api, $cmp) => {
                            return [$api.h('div', {
                                key: 0,
                                props: {
                                    title: $cmp.id
                                }
                            }, [])];
                        }
                    }
                }
                const element = createElement('prop-setter-id-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.id = 'ltr';
                return Promise.resolve()
                    .then(() => {
                        expect(count).toBe(1);
                    });
            });

            it('should call getter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    get id() {
                        count += 1;
                        return 'id';
                    }
                }
                MyComponent.publicProps = {
                    id: {
                        config: 1,
                    }
                }
                const element = createElement('prop-getter-id-imperative', { is: MyComponent });
                expect(element.id).toBe('id');
                expect(count).toBe(1);
            });

            it('should be reactive by default', () => {
                let renderCount = 0;
                class MyComponent extends Element {
                    render() {
                        return ($api, $cmp) => {
                            renderCount += 1;
                            return [
                                $api.h('div', {
                                    key: 0,
                                    props: {
                                        title: $cmp.id
                                    }
                                }, [])
                            ];
                        }
                    }
                }
                const element = createElement('prop-id-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.id = 'id';
                return Promise.resolve()
                    .then(() => {
                        expect(renderCount).toBe(2);
                        expect(querySelector.call(element, 'div')!.title).toBe('id');
                    });
            });

            it('should throw an error when setting default value in constructor', () => {
                class MyComponent extends Element {
                    constructor() {
                        super();
                        this.id = 'id';
                    }
                }
                expect(() => {
                    createElement('x-foo', { is: MyComponent });
                }).toThrowError("Failed to construct '<x-foo>': The result must not have attributes.");

            });
        });

        describe('#accessKey', () => {
            it('should reflect attribute by default', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-reflect-accessKey', { is: MyComponent });
                element.accessKey = 'accessKey';
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'accesskey')).toBe('accessKey');
            });

            it('should return correct value from getter', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-accessKey', { is: MyComponent });
                element.accessKey = 'accessKey';
                expect(element.accessKey).toBe('accessKey');
            });

            it('should call setter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    set accessKey(value) {
                        count += 1;
                    }
                    get accessKey() {}
                }
                MyComponent.publicProps = {
                    accessKey: {
                        config: 3,
                    }
                }
                const element = createElement('prop-setter-accessKey', { is: MyComponent });
                element.accessKey = {},
                expect(count).toBe(1);
            });

            it('should not be reactive when defining own setter', () => {
                let count = 0;
                class MyComponent extends Element {
                    set accessKey(value) {

                    }

                    render() {
                        count += 1;
                        return ($api, $cmp) => {
                            return [$api.h('div', {
                                key: 0,
                                props: {
                                    title: $cmp.accessKey
                                }
                            }, [])];
                        }
                    }
                }
                const element = createElement('prop-setter-accessKey-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.accessKey = 'accessKey';
                return Promise.resolve()
                    .then(() => {
                        expect(count).toBe(1);
                    });
            });

            it('should call getter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    get accessKey() {
                        count += 1;
                        return 'accessKey';
                    }
                }
                MyComponent.publicProps = {
                    accessKey: {
                        config: 1,
                    }
                }
                const element = createElement('prop-getter-accessKey-imperative', { is: MyComponent });
                expect(element.accessKey).toBe('accessKey');
                expect(count).toBe(1);
            });

            it('should be reactive by default', () => {
                let renderCount = 0;
                class MyComponent extends Element {
                    render() {
                        return ($api, $cmp) => {
                            renderCount += 1;
                            return [
                                $api.h('div', {
                                    key: 0,
                                    props: {
                                        title: $cmp.accessKey
                                    }
                                }, [])
                            ];
                        }
                    }
                }
                const element = createElement('prop-accessKey-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.accessKey = 'accessKey';
                return Promise.resolve()
                    .then(() => {
                        expect(renderCount).toBe(2);
                        expect(querySelector.call(element, 'div')!.title).toBe('accessKey');
                    });
            });

            it('should throw an error when setting default value in constructor', () => {
                class MyComponent extends Element {
                    constructor() {
                        super();
                        this.accessKey = 'accessKey';
                    }
                }
                expect(() => {
                    createElement('x-foo', { is: MyComponent });
                }).toThrowError("Failed to construct '<x-foo>': The result must not have attributes.");

            });
        });

        describe('#title', () => {
            it('should reflect attribute by default', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-reflect-title', { is: MyComponent });
                element.title = 'title';
                expect(HTMLEmbedElement.prototype.getAttribute.call(element, 'title')).toBe('title');
            });

            it('should return correct value from getter', () => {
                class MyComponent extends Element {

                }
                const element = createElement('prop-getter-title', { is: MyComponent });
                element.title = 'title';
                expect(element.title).toBe('title');
            });

            it('should call setter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    set title(value) {
                        count += 1;
                    }
                    get title() {}
                }
                MyComponent.publicProps = {
                    title: {
                        config: 3,
                    }
                }
                const element = createElement('prop-setter-title', { is: MyComponent });
                element.title = {},
                expect(count).toBe(1);
            });

            it('should not be reactive when defining own setter', () => {
                let count = 0;
                class MyComponent extends Element {
                    set title(value) {

                    }

                    render() {
                        count += 1;
                        return ($api, $cmp) => {
                            return [$api.h('div', {
                                key: 0,
                                props: {
                                    id: $cmp.title
                                }
                            }, [])];
                        }
                    }
                }
                const element = createElement('prop-setter-title-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.title = 'title';
                return Promise.resolve()
                    .then(() => {
                        expect(count).toBe(1);
                    });
            });

            it('should call getter defined in component', () => {
                let count = 0;
                class MyComponent extends Element {
                    get title() {
                        count += 1;
                        return 'title';
                    }
                }
                MyComponent.publicProps = {
                    title: {
                        config: 1,
                    }
                }
                const element = createElement('prop-getter-title-imperative', { is: MyComponent });
                expect(element.title).toBe('title');
                expect(count).toBe(1);
            });

            it('should be reactive by default', () => {
                let renderCount = 0;
                class MyComponent extends Element {
                    render() {
                        return ($api, $cmp) => {
                            renderCount += 1;
                            return [
                                $api.h('div', {
                                    key: 0,
                                    props: {
                                        id: $cmp.title
                                    }
                                }, [])
                            ];
                        }
                    }
                }
                const element = createElement('prop-title-reactive', { is: MyComponent });
                document.body.appendChild(element);
                element.title = 'title';
                return Promise.resolve()
                    .then(() => {
                        expect(renderCount).toBe(2);
                        expect(querySelector.call(element, 'div')!.id).toBe('title');
                    });
            });

            it('should throw an error when setting default value in constructor', () => {
                class MyComponent extends Element {
                    constructor() {
                        super();
                        this.title = 'title';
                    }
                }
                expect(() => {
                    createElement('x-foo', { is: MyComponent });
                }).toThrowError("Failed to construct '<x-foo>': The result must not have attributes.");

            });
        });

        it('should always return null', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(this.getAttribute('title')).toBeNull();
                }
            }
            createElement('x-foo', { is: def }).setAttribute('title', 'cubano');
        });

        it('should set user specified value during setAttribute call', () => {
            let userDefinedTabIndexValue = -1;
            class MyComponent extends Element {
                renderedCallback() {
                    userDefinedTabIndexValue = this.getAttribute("tabindex");
                }
            }
            const elm = createElement('x-foo', {is: MyComponent});
            elm.setAttribute('tabindex', '0');
            document.body.appendChild(elm);

            return Promise.resolve().then( ()=> {
                expect(userDefinedTabIndexValue).toBe('0');
            });

        }),

        it('should log console error when user land code changes attribute via querySelector', () => {
            jest.spyOn(assertLogger, 'logError');
            class Parent extends Element {
                render() {
                    return function($api, $cmp) {
                        return [
                            $api.c('x-child', Child, { attrs: { title: 'child title' }})
                        ]
                    }
                }
            }
            class Child extends Element {}
            const parentElm = createElement('x-parent', { is: Parent });
            document.body.appendChild(parentElm);

            return Promise.resolve().then( () => {
                const childElm = querySelector.call(parentElm, 'x-child');
                childElm.setAttribute('title', "value from parent");
                expect(assertLogger.logError).toBeCalled();
                assertLogger.logError.mockRestore();
            })
        })

        it('should log console error when user land code removes attribute via querySelector', () => {
            jest.spyOn(assertLogger, 'logError');
            class Parent extends Element {
                render() {
                    return function($api, $cmp) {
                        return [
                            $api.c('x-child', Child, { attrs: { title: 'child title' }})
                        ]
                    }
                }
            }
            class Child extends Element {}
            const parentElm = createElement('x-parent', { is: Parent });
            document.body.appendChild(parentElm);

            return Promise.resolve().then( () => {
                const childElm = querySelector.call(parentElm, 'x-child');
                childElm.removeAttribute('title');
                expect(assertLogger.logError).toBeCalled();
                assertLogger.logError.mockRestore();
            })
        })

        it('should not log error message when arbitrary attribute is set via elm.setAttribute', () => {
            jest.spyOn(assertLogger, 'logError');
            class MyComponent extends Element {}
            const elm = createElement('x-foo', {is: MyComponent});
            elm.setAttribute('foo', 'something');
            document.body.appendChild(elm);

            return Promise.resolve().then( () => {
                expect(assertLogger.logError).not.toBeCalled();
                assertLogger.logError.mockRestore();
            })
        })

        it('should delete existing attribute prior rendering', () => {
            const def = class MyComponent extends Element {}
            const elm = createElement('x-foo', { is: def });
            elm.setAttribute('title', 'parent title');
            elm.removeAttribute('title');
            document.body.appendChild(elm);

            return Promise.resolve().then( () => {
                expect(elm.getAttribute('title')).not.toBe('parent title');
            })
        }),

        it('should correctly set child attribute ', () => {
            let childTitle = null;

            class Parent extends Element {
                render() {
                    return function($api, $cmp) {
                        return [
                            $api.c('x-child', Child, { props: { title: 'child title' }})
                        ]
                    }
                }
            }

            class Child extends Element {
                renderedCallback() {
                    childTitle = this.getAttribute('title');
                }
            }

            const parentElm = createElement('x-parent', { is: Parent });
            parentElm.setAttribute('title', 'parent title');
            document.body.appendChild(parentElm);

            return Promise.resolve().then( () => {
                const childElm = querySelector.call(parentElm, 'x-child');
                expect(childElm.getAttribute('title')).toBe('child title');
            })
        })
    });

});
