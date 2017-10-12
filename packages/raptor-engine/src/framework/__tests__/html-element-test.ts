import { Element } from "../html-element";
import { createElement } from "../upgrade";
import { OwnerKey } from "../vm";
import * as api from "../api";
import { patch } from '../patch';
import assert from 'power-assert';
import assertLogger from './../assert';

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
            let containsFoo = false;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.classList.add('foo');
                    containsFoo = this.classList.contains('foo');
                }
            }
            createElement('x-foo', { is: def });
            assert(containsFoo === true, 'classList does not contain "foo"');
        });
    });

    describe('#getAttribute()', () => {
        it('should throw when no attribute name is provided', () => {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => this.getAttribute()).toThrow();
                }
            }
            createElement('x-foo', { is: def });
            expect.assertions(1);
        });
        it('should throw when attribute name matches a declared public property', () => {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => this.getAttribute('foo')).toThrow();
                }
            }
            def.publicProps = { foo: "default value" };
            createElement('x-foo', { is: def });
            expect.assertions(1);
        });
        it('should be null for non-valid attribute names', () => {
            let attributeValueForNull, attributeValueForUndefined, attributeValueForEmpty;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    attributeValueForNull = this.getAttribute(null);
                    attributeValueForUndefined = this.getAttribute(undefined);
                    attributeValueForEmpty = this.getAttribute("");
                }
            }
            createElement('x-foo', { is: def });
            assert(attributeValueForNull === null, 'null attribute name');
            assert(attributeValueForUndefined === null, 'undefined attribute name');
            assert(attributeValueForEmpty === null, 'empty attribute name');
        });
        it('should be null for non-existing attributes', () => {
            let attributeValueForFooBarBaz;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    attributeValueForFooBarBaz = this.getAttribute("foo-bar-baz");
                }
            }
            createElement('x-foo', { is: def });
            assert(attributeValueForFooBarBaz === null);
        });

    });

    describe('#dispatchEvent', function () {
        it('should throw when event is dispatched during construction', function () {
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
            expect.assertions(1);
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

        it ('should log warning when event name contains non-alphanumeric lowercase characters', function () {
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

        it ('should log warning when event name does not start with alphabetic lowercase characters', function () {
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

        it ('should not log warning for alphanumeric lowercase event name', function () {
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
            let tagName;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    tagName = this.tagName;
                }
            }
            createElement('x-foo', { is: def });
            assert.equal(tagName, 'X-FOO');
        });
    });

    describe('#state', () => {
        it('should have a valid value during construction', () => {
            let state;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    state = this.state;
                }
            }
            createElement('x-foo', { is: def });
            assert.deepEqual(state, {});
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
            createElement('x-foo', { is: def });
            assert(state.foo === 1);
            assert(state.bar === 2);
            assert(state.baz === 3);
            assert(o.foo === 1);
            assert(o.bar === 2);
            assert(o.baz === 3);
            assert(o !== state);
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
            createElement('x-foo', { is: def });
            expect({ x: 1, y: o }).toDeepEqualProxy(state);
            assert.notEqual(state.y, o, 'proxified object');
        });
        it('should throw an error when assigning arrays', function () {
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.state = [1, 2];
                    }).toThrow();
                }
            }
            createElement('x-foo', { is: MyComponent });
        });
        it('should throw an error when assigning primitive', function () {
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.state = 1;
                    }).toThrow();
                }
            }
            createElement('x-foo', { is: MyComponent });
        });
        it('should throw an error when assigning non-observable object', function () {
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.state = Object.create({});
                    }).toThrow();
                }
            }
            createElement('x-foo', { is: MyComponent });
        });
        it('should throw an error when assigning exotic object', function () {
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.state = Date.now();
                    }).toThrow();
                }
            }
            createElement('x-foo', { is: MyComponent });
        });
        it('should not throw an error when assigning observable object', function () {
            class MyComponent extends Element {
                constructor() {
                    super();
                    expect(() => {
                        this.state = {};
                    }).not.toThrow();
                }
            }
            createElement('x-foo', { is: MyComponent });
        });
    });

    describe('global HTML Properties', () => {
        it('should always return undefined', () => {
            let attrTitle;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    attrTitle = this.getAttribute('title');
                }
            }
            createElement('x-foo', { is: def }).setAttribute('title', 'cubano');
            assert.equal(attrTitle, undefined, 'wrong attribute');
        });
    });

    describe('#toString()', () => {
        it('should produce a nice tag', () => {
            let str;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    str = this.toString();
                }
            }
            createElement('x-foo', { is: def });
            assert.equal(str, '<x-foo>');
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
                assert.strictEqual('P', node.tagName);
                assert(vnode.vm.uid !== node[OwnerKey], 'uid was not propagated');
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
                const node = vnode.vm.component.querySelector('p');
                assert.strictEqual(null, node);
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
            assert.strictEqual(vnode.vm.component.querySelector('div'), null);
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
                assert.strictEqual(1, nodes.length);
                assert(vnode.vm.uid !== nodes[0][OwnerKey], 'uid was not propagated');
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
                const nodes = vnode.vm.component.querySelectorAll('p');
                assert.strictEqual(0, nodes.length);
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
            assert.deepEqual(['title', '1', '2'], a);
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
            assert.strictEqual(2, a);
            assert.strictEqual(ctx, vnode1.vm.component);
        });

    });

    describe('#tabIndex', function () {
        it('should have a valid value during connectedCallback', function () {
            let tabIndex;
            class MyComponent extends Element {
                connectedCallback() {
                    tabIndex = this.tabIndex;
                }
            }

            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { attrs: { tabindex: 3 } });
            patch(elm, vnode);


            return Promise.resolve().then(() => {
                assert.deepEqual(tabIndex, 3);
            });
        });

        it('should have a valid value after initial render', function () {
            class MyComponent extends Element {}

            const elm = document.createElement('x-foo');
            const vnode = api.c('x-foo', MyComponent, { attrs: { tabindex: 3 } });
            patch(elm, vnode);


            return Promise.resolve().then(() => {
                assert.deepEqual(vnode.vm.component.tabIndex, 3);
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
                assert.deepEqual(elm.tabIndex, 2);
                assert.deepEqual(vnode.vm.component.tabIndex, 2);
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
                assert.deepEqual(1, callCount); // one because of the attribute value from outside
                assert.deepEqual(2, elm.tabIndex);
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
                assert.deepEqual(callCount, 1);
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
                assert.deepEqual(elm.tabIndex, 4);
                assert.deepEqual(vnode.vm.component.tabIndex, 4);
            });
        });

        it('should throw if setting tabIndex during render', function () {
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
            assert.deepEqual(called, 0);
            document.body.removeChild(elm);
            assert.deepEqual(called, 1);
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
                assert.deepEqual(rendered, 0);
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
            assert.deepEqual(rendered, 1);
            elm.x = 2;
            return Promise.resolve().then(() => {
                assert.deepEqual(rendered, 1);
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
    });

});
