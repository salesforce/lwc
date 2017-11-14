import { Element } from "../html-element";
import { createElement } from "../upgrade";
import { OwnerKey } from "../vm";
import * as api from "../api";
import { patch } from '../patch';
import assertLogger from './../assert';
import { register } from "./../services";

describe('html-element', () => {

    describe('#getBoundingClientRect()', () => {
        it('should throw during construction', () => {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.getBoundingClientRect();
                    }).toThrow();
                }
            }
            createElement('x-foo', { is: def });
            expect.assertions(1);
        });
    });

    describe('#classList()', () => {
        it('should have a valid classList during construction', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                    expect(this.classList.contains('foo')).toBe(true);
                }
            }
            createElement('x-foo', { is: def });
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
            }
            createElement('x-foo', { is: def });
        });
        it('should throw when attribute name matches a declared public property', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => this.getAttribute('foo')).toThrow();
                }
            }
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
            }
            createElement('x-foo', { is: def });
        });
        it('should be null for non-existing attributes', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(this.getAttribute("foo-bar-baz")).toBeNull();
                }
            }
            createElement('x-foo', { is: def });
        });

    });

    describe('#dispatchEvent', function () {
        it('should pierce dispatch event', function () {
            let callCount = 0;
            register({
                piercing: (component, data, def, context, target, key, value, callback) => {
                    if (value === EventTarget.prototype.dispatchEvent) {
                        callCount += 1;
                    }
                }
            })
            class Foo extends Element {
                connectedCallback() {
                    const event = new CustomEvent('badevent', {
                        bubbles: true,
                        composed: true
                    });
                    this.dispatchEvent(event);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(callCount).toBe(1);
        });
        it('should use custom function pierced for dispatch event', function () {
            let event;
            let received;
            let piercedThis;
            let count = 0;
            const pierced = function (evt) {
                piercedThis = this;
                received = evt;
                count += 1;
            }
            register({
                piercing: (component, data, def, context, target, key, value, callback) => {
                    if (value === EventTarget.prototype.dispatchEvent) {
                        callback(pierced);
                    }
                }
            })
            class Foo extends Element {
                connectedCallback() {
                    event = {
                        type: 'secure',
                        composed: true,
                        bubbles: true
                    };
                    this.dispatchEvent(event);
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
            expect(count).toBe(1);
            expect(piercedThis).toBe(elm);
            expect(received).toBe(event);
        });
        it('should log a warning when dispatching an event without composed flag', function () {
            class Foo extends Element {
                connectedCallback() {
                    const event = new CustomEvent('badevent', {
                        bubbles: true
                    });
                    this.dispatchEvent(event);
                }
            }
            jest.spyOn(assertLogger, 'logWarning');
            const elem = createElement('x-foo', { is: Foo });
            document.body.appendChild(elem);
            expect(assertLogger.logWarning).toBeCalledWith('Invalid event "badevent" dispatched in element <x-foo>. Events with \'bubbles: true\' must also be \'composed: true\'. Without \'composed: true\', the dispatched event will not be observable outside of your component.');
            assertLogger.logWarning.mockRestore();
        });
        it('should log a warning when dispatching an event with bubbles: true, composed: false', function () {
            class Foo extends Element {
                connectedCallback() {
                    const event = new CustomEvent('badevent', {
                        composed: false,
                        bubbles: true
                    });
                    this.dispatchEvent(event);
                }
            }
            jest.spyOn(assertLogger, 'logWarning');
            const elem = createElement('x-foo', { is: Foo });
            document.body.appendChild(elem);
            expect(assertLogger.logWarning).toBeCalledWith('Invalid event "badevent" dispatched in element <x-foo>. Events with \'bubbles: true\' must also be \'composed: true\'. Without \'composed: true\', the dispatched event will not be observable outside of your component.');
            assertLogger.logWarning.mockRestore();
        });
        it('should throw when event is dispatched during construction', function () {
            expect.assertions(1);
            class Foo extends Element {
                constructor () {
                    super();
                    expect(() => {
                        this.dispatchEvent(new CustomEvent('constructorevent'));
                    }).toThrow('this.dispatchEvent() should not be called during the construction of the custom element for <x-foo> because no one is listening for the event "constructorevent" just yet.');
                }
            }
            const elm = createElement('x-foo', { is: Foo });
            document.body.appendChild(elm);
        });

        it('should log warning when element is not connected', function () {
            class Foo extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', Foo, {});
            const vnode2 = api.h('div', {}, []);
            patch(elm, vnode);
            patch(vnode, vnode2);
            jest.spyOn(assertLogger, 'logWarning')

            return Promise.resolve().then(() => {
                vnode.vm.component.dispatchEvent(new CustomEvent('warning'));
                expect(assertLogger.logWarning).toBeCalledWith('Unreachable event "warning" dispatched from disconnected element <x-foo>. Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback).');
                assertLogger.logWarning.mockRestore();
            });
        });

        it('should not log warning when element is connected', function () {
            class Foo extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', Foo, {});
            const vnode2 = api.h('div', {}, []);
            patch(elm, vnode);
            jest.spyOn(assertLogger, 'logWarning')

            return Promise.resolve().then(() => {
                vnode.vm.component.dispatchEvent(new CustomEvent('warning'));
                expect(assertLogger.logWarning).not.toBeCalled();
                assertLogger.logWarning.mockRestore();
            });
        });

        it('should log warning when event name contains non-alphanumeric lowercase characters', function () {
            class Foo extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', Foo, {});
            patch(elm, vnode);
            jest.spyOn(assertLogger, 'logWarning')

            return Promise.resolve().then(() => {
                vnode.vm.component.dispatchEvent(new CustomEvent('foo1-$'));
                expect(assertLogger.logWarning).toBeCalled();
                assertLogger.logWarning.mockRestore();
            });
        });

        it('should log warning when event name does not start with alphabetic lowercase characters', function () {
            class Foo extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', Foo, {});
            patch(elm, vnode);
            jest.spyOn(assertLogger, 'logWarning')
            return Promise.resolve().then( ()=> {
                vnode.vm.component.dispatchEvent(new CustomEvent('123'));
                expect(assertLogger.logWarning).toBeCalled();
                assertLogger.logWarning.mockRestore();
            })
        });

        it('should not log warning for alphanumeric lowercase event name', function () {
            class Foo extends Element {}
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', Foo, {});
            patch(elm, vnode);
            jest.spyOn(assertLogger, 'logWarning')
            return Promise.resolve().then( ()=> {
                vnode.vm.component.dispatchEvent(new CustomEvent('foo1234abc'));
                expect(assertLogger.logWarning).not.toBeCalled();
                assertLogger.logWarning.mockRestore();
            })
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
            }
            createElement('x-foo', { is: def });
        });
    });

    describe('#tracked', () => {
        it('should warn if component has untracked state property', function () {
            jest.spyOn(assertLogger, 'logWarning');
            class MyComponent extends Element {
                state = {}
            }
            const element = createElement('x-foo', { is: MyComponent });
            expect(assertLogger.logWarning).toHaveBeenCalledWith('Non-trackable component state detected in <x-foo>. Updates to state property will not be reactive. To make state reactive, add @track decorator.');
            assertLogger.logWarning.mockRestore();
        });
        it('should not warn if component has tracked state property', function () {
            jest.spyOn(assertLogger, 'logWarning');
            class MyComponent extends Element {
                state = {}
            }
            MyComponent.track = { state: 1 };
            const element = createElement('x-foo', { is: MyComponent });
            expect(assertLogger.logWarning).not.toHaveBeenCalled();
            assertLogger.logWarning.mockRestore();
        });
        it('should be mutable during construction', () => {
            let state;
            let o = { foo: 1, bar: 2, baz: 1 };
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
            }
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
            let o = { foo: 1 };
            const def = class MyComponent extends Element {
                state = { x: 1, y: o };
                constructor() {
                    super();
                    state = this.state;
                }
            }
            def.track = { state: 1 };
            createElement('x-foo', { is: def });
            expect({ x: 1, y: o }).toEqual(state);
            expect(state.y).not.toBe(o);
        });
        it('should not throw an error when assigning observable object', function () {
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
            }
            createElement('x-foo', { is: def }).setAttribute('title', 'cubano');
        });

        it('should set user specified value during setAttribute call', () => {
            let userDefinedTabIndexValue = -1;
            class MyComponent extends Element {
                constructor() {
                    super();
                }

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

        it('should delete existing attribute prior rendering', () => {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                }
            }
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
                constructor() {
                    super();
                }

                render() {
                    return function($api, $cmp) {
                        return [
                            $api.c('x-child', Child, { attrs: { title: 'child title' }})
                        ]
                    }
                }
            }

            class Child extends Element {
                constructor() {
                    super();
                }

                renderedCallback() {
                    childTitle = this.getAttribute('title');
                }
            }

            const parentElm = createElement('x-parent', { is: Parent });
            parentElm.setAttribute('title', 'parent title');
            document.body.appendChild(parentElm);

            return Promise.resolve().then( () => {
                const childElm = parentElm.querySelector('x-child');
                expect(childElm.getAttribute('title')).toBe('child title');
            })
        })
    });

    describe('#toString()', () => {
        it('should produce a nice tag', () => {
            expect.assertions(1);
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(this.toString()).toBe('<x-foo>');
                }
            }
            createElement('x-foo', { is: def });
        });
    });

    describe('#querySelector()', () => {
        it('should allow searching for the passed element', () => {
            const outerp = api.h('p', {}, []);
            const def = class MyComponent extends Element {
                render() {
                    return () => [outerp]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                const node = vnode.vm.component.querySelector('p');
                expect(node.tagName).toBe('P');
                expect(vnode.vm.uid).not.toBe(node[OwnerKey]);
            });
        });

        it('should ignore element from template', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('p', {}, [])]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                expect(vnode.vm.component.querySelector('p')).toBeNull();
            });
        });

        it('should not throw an error if element does not exist', () => {
            const outerp = api.h('p', {}, []);
            const def = class MyComponent extends Element {
                render() {
                    return () => [outerp]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                expect(() => {
                    vnode.vm.component.querySelector('div');
                }).not.toThrow();
            });
        });

        it('should return null if element does not exist', function () {
            const outerp = api.h('p', {}, []);
            const def = class MyComponent extends Element {
                render() {
                    return () => [outerp]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            expect(vnode.vm.component.querySelector('div')).toBeNull();
        });
    });

    describe('#querySelectorAll()', () => {

        it('should allow searching for passed elements', () => {
            const outerp = api.h('p', {}, []);
            const def = class MyComponent extends Element {
                render() {
                    return () => [outerp]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                const nodes = vnode.vm.component.querySelectorAll('p');
                expect(nodes).toHaveLength(1);
                expect(vnode.vm.uid).not.toBe(nodes[0][OwnerKey]);
            });
        });

        it('should ignore elements from template', () => {
            const def = class MyComponent extends Element {
                render() {
                    return () => [api.h('p', {}, [])]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                expect(vnode.vm.component.querySelectorAll('p')).toHaveLength(0);
            });
        });

        it('should not throw an error if no nodes are found', () => {
            const outerp = api.h('p', {}, []);
            const def = class MyComponent extends Element {
                render() {
                    return () => [outerp]
                }
            }
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', def, {});
            patch(elm, vnode);
            return Promise.resolve().then(() => {
                expect(() => {
                    vnode.vm.component.querySelectorAll('div');
                }).not.toThrow();
            });
        });

    });

    describe('#data layer', () => {
        it('should allow custom attributeChangedCallback', () => {
            let a;
            class MyComponent extends Element  {}
            MyComponent.observedAttributes = ['title'];
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode1 = api.c('x-foo', MyComponent, { attrs: { title: 1 } });
            const vnode2 = api.c('x-foo', MyComponent, { attrs: { title: 2 } });
            patch(elm, vnode1);
            vnode1.vm.component.attributeChangedCallback = function() {
                a = Array.prototype.slice.call(arguments, 0);
            };
            patch(vnode1, vnode2);
            expect(a).toEqual(['title', '1', '2']);
        });

        it('should allow custom instance getter and setter', () => {
            let a, ctx;
            class MyComponent extends Element  {}
            MyComponent.publicProps = { foo: true };
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode1 = api.c('x-foo', MyComponent, { props: { foo: 1 } });
            const vnode2 = api.c('x-foo', MyComponent, { props: { foo: 2 } });
            patch(elm, vnode1);
            Object.defineProperty(vnode1.vm.component, 'foo', {
                set: function (value) {
                    ctx = this;
                    a = value;
                }
            })
            patch(vnode1, vnode2);
            expect(a).toBe(2);
            expect(vnode1.vm.component).toBe(ctx);
        });
    });

    describe('#tabIndex', function () {
        it('should have a valid value during connectedCallback', function () {
            expect.assertions(1);

            class MyComponent extends Element {
                connectedCallback() {
                    expect(this.tabIndex).toBe(3);
                }
            }

            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { attrs: { tabindex: 3 } });
            patch(elm, vnode);
        });

        it('should have a valid value after initial render', function () {
            class MyComponent extends Element {}

            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { attrs: { tabindex: 3 } });
            patch(elm, vnode);


            return Promise.resolve().then(() => {
                expect(vnode.vm.component.tabIndex).toBe(3);
            });
        });

        it('should set tabindex correctly', function () {
            class MyComponent extends Element {
                connectedCallback () {
                    this.tabIndex = 2;
                }
            }

            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { attrs: { tabindex: 3 } });
            patch(elm, vnode);

            return Promise.resolve().then(() => {
                expect(elm.tabIndex).toBe(2);
                expect(vnode.vm.component.tabIndex).toBe(2);
            });
        });

        it('should not trigger attribute changed callback when changed from within', function () {
            let callCount = 0;
            class MyComponent extends Element {
                attributeChangedCallback() {
                    callCount += 1;
                }
                connectedCallback () {
                    this.tabIndex = 2;
                }
            }

            MyComponent.observedAttributes = ['tabindex'];

            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { attrs: {  tabindex: 3 } });
            patch(elm, vnode);

            return Promise.resolve().then(() => {
                expect(callCount).toBe(1); // one because of the attribute value from outside
                expect(elm.tabIndex).toBe(2);
            });
        });

        it('should not trigger render cycle', function () {
            let callCount = 0;
            class MyComponent extends Element {
                connectedCallback () {
                    this.tabIndex = 2;
                }
                render () {
                    callCount += 1;
                    return () => [];
                }
            }

            MyComponent.observedAttributes = ['tabindex'];

            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { attrs: { tabindex: 3 } });
            patch(elm, vnode);

            return Promise.resolve().then(() => {
                expect(callCount).toBe(1);
            });
        });


        it('should allow parent component to overwrite internally set tabIndex', function () {
            class MyComponent extends Element {
                connectedCallback () {
                    this.tabIndex = 2;
                }
            }

            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { attrs: { tabindex: 3 } });
            const vnode2 = api.c('x-foo', MyComponent, { attrs: { tabindex: 4 } });
            patch(elm, vnode);

            return Promise.resolve().then(() => {
                patch(vnode, vnode2);

                return Promise.resolve();
            })
            .then(() => {
                expect(elm.tabIndex).toBe(4);
                expect(vnode.vm.component.tabIndex).toBe(4);
            });
        });

        it('should throw if setting tabIndex during render', function () {
            expect.assertions(1);
            class MyComponent extends Element {
                render () {
                    expect(() => {
                        this.tabIndex = 2;
                    }).toThrow();
                    return () => [];
                }
            }

            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
        });

        it('should throw if setting tabIndex during construction', function () {
            expect.assertions(1);
            class MyComponent extends Element {
                constructor () {
                    super();
                    expect(() => {
                        this.tabIndex = 2;
                    }).toThrow();
                }
            }
            createElement('x-foo', { is: MyComponent });
        });
    });


    describe('life-cycles', function () {
        it('should guarantee that the element is rendered when inserted in the DOM', function () {
            let rendered = 0;
            class MyComponent extends Element {
                render () {
                    rendered++;
                    return () => [];
                }
            }
            const elm = createElement('x-foo', { is: MyComponent });
            expect(rendered).toBe(0);
            document.body.appendChild(elm);
            expect(rendered).toBe(1);
        });

        it('should guarantee that the connectedCallback is invoked sync after the element is inserted in the DOM', function () {
            let called = 0;
            class MyComponent extends Element {
                render () {
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

        it('should guarantee that the connectedCallback is invoked before render after the element is inserted in the DOM', function () {
            const ops: Array<string> = [];
            class MyComponent extends Element {
                render () {
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

        it('should guarantee that the disconnectedCallback is invoked sync after the element is removed from the DOM', function () {
            let called = 0;
            class MyComponent extends Element {
                render () {
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

        it('should not render even if there is a mutation if the element is not in the DOM yet', function () {
            let rendered = 0;
            class MyComponent extends Element {
                render () {
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

        it('should not render if the element was removed from the DOM', function () {
            let rendered = 0;
            class MyComponent extends Element {
                render () {
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

        it('should observe moving the element thru the DOM tree', function () {
            let rendered = 0;
            let connected = 0;
            let disconnected = 0;
            class MyComponent extends Element {
                render () {
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
            var div = document.createElement('div');
            document.body.appendChild(div);
            div.appendChild(elm);
            expect(rendered).toBe(2);
            expect(connected).toBe(2);
            expect(disconnected).toBe(1);
        });

        it('should not throw error when accessing a non-observable property from tracked property when not rendering', function () {
            class MyComponent extends Element {
                state = {}
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

        it('should not log a warning when setting tracked value to null', function () {
            jest.spyOn(assertLogger, 'logWarning');
            class MyComponent extends Element {
                state = {};
                connectedCallback() {
                    this.state.foo = null;
                    this.state.foo;
                }
            }
            MyComponent.track = { state: 1 };
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(assertLogger.logWarning).not.toBeCalled();
            assertLogger.logWarning.mockRestore();
        });

        it('should not log a warning when initializing api value to null', function () {
            jest.spyOn(assertLogger, 'logWarning');
            class MyComponent extends Element {
                foo = null;
            }
            MyComponent.publicProps = {
                foo: {
                    config: 0
                }
            };
            const elm = createElement('x-foo', { is: MyComponent });
            document.body.appendChild(elm);
            expect(assertLogger.logWarning).not.toBeCalled();
            assertLogger.logWarning.mockRestore();
        });
    });

});
