import { Element } from "../html-element";
import { createElement } from "../upgrade";
import { OwnerKey } from "../vm";
import * as api from "../api";
import { patch } from '../patch';
import assert from 'power-assert';

describe('html-element', () => {

    describe('#getBoundingClientRect()', () => {
        it('should throw during construction', () => {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.getBoundingClientRect();
                }
            }
            assert.throws(() => {
                createElement('x-foo', { is: def });
            });
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
                    this.getAttribute();
                }
            }
            assert.throws(() => createElement('x-foo', { is: def }));
        });
        it('should throw when attribute name matches a declared public property', () => {
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.getAttribute('foo');
                }
            }
            def.publicProps = { foo: "default value" };
            assert.throws(() => createElement('x-foo', { is: def }));
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
            assert.deepEqual(state, { x: 1, y: o }, 'deep structure');
            assert.notEqual(state.y, o, 'proxified object');
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

    describe('public getters', () => {
        it('should allow public getters', function () {
            class MyComponent extends Element  {
                get breakfast () {
                    return 'pancakes';
                }
            }

            MyComponent.publicProps = {
                breakfast: {
                    config: 1
                }
            };

            class Parent extends Element {
                get parentGetter () {
                    return 'parentgetter';
                }

                render () {
                    return () => [api.c('x-component', MyComponent, {})];
                }
            }

            Parent.publicProps = {
                parentGetter: {
                    config: 1
                }
            };

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', Parent, {});
            patch(elm, vnode);
            assert.deepEqual(elm.parentGetter, 'parentgetter');
            assert.deepEqual(elm.querySelector('x-component').breakfast, 'pancakes');
        });

        it('should be render reactive', function () {
            class MyComponent extends Element  {
                state = { value: 0 };
                get validity () {
                    return this.state.value > 5;
                }
                render () {
                    return ($api, $cmp, $slotset, $ctx) => {
                        return [$api.h('div', {}, [$api.d($cmp.validity)])];
                    }
                }
            }

            MyComponent.publicProps = {
                validity: {
                    config: 1
                }
            };

            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode = api.c('x-foo', MyComponent, {});
            patch(elm, vnode);
            vnode.vm.component.state.value = 10;
            return Promise.resolve().then(() => {
                assert.deepEqual(elm.textContent, 'true');
            });
        });
    })

    describe('#data layer', () => {

        it('should allow custom attributeChangedCallback', () => {
            let a;
            class MyComponent extends Element  {}
            MyComponent.publicProps = { foo: true };
            MyComponent.observedAttributes = ['foo'];
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode1 = api.c('x-foo', MyComponent, { props: { foo: 1 } });
            const vnode2 = api.c('x-foo', MyComponent, { props: { foo: 2 } });
            patch(elm, vnode1);
            vnode1.vm.component.attributeChangedCallback = () => {
                a = Array.prototype.slice.call(arguments, 0);
            };
            patch(vnode1, vnode2);
            assert.deepEqual(['foo', 1, 2], a);
        });

        it('should support wired properties', () => {
            class MyComponent extends Element  {}
            MyComponent.wire = { foo: {} };
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode1 = api.c('x-foo', MyComponent, {});
            patch(elm, vnode1);
            assert('foo' in vnode1.vm.component, 'wired property should be defined on component');
            const o = { x: 1 };
            vnode1.vm.component.foo = o;
            assert.deepEqual(o, vnode1.vm.component.foo, 'assignment on wired property should work as expected');
            assert(o !== vnode1.vm.component, 'wired property was not profixied');
        });

        it('should make wired properties reactive', () => {
            let counter = 0;
            class MyComponent extends Element {
                constructor() {
                    super();
                    this.foo = { x: 1 };
                }
                render() {
                    counter++;
                    this.foo.x;
                }
            }
            MyComponent.wire = { foo: {} };
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode1 = api.c('x-foo', MyComponent, {});
            patch(elm, vnode1);
            vnode1.vm.component.foo.x = 2;
            return Promise.resolve().then(() => {
                assert.strictEqual(2, counter);
            });
        });

        it('should ignore wired methods', () => {
            class MyComponent extends Element {}
            MyComponent.wire = { foo: { method: 1 } };
            const elm = document.createElement('x-foo');
            document.body.appendChild(elm);
            const vnode1 = api.c('x-foo', MyComponent, {});
            patch(elm, vnode1);
            assert(("foo" in vnode1.vm.component) === false);
        });

    });

});
