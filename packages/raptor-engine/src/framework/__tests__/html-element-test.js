import { Element } from "../html-element.js";
import { createElement } from "../upgrade.js";
import assert from 'power-assert';
import * as api from "../api.js";
import { patch } from '../patch.js';

describe('Raptor.Element', () => {

    describe('#getBoundingClientRect()', () => {
        it('should return empty during construction', () => {
            let rect;
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    rect = this.getBoundingClientRect();
                }
            }
            createElement('x-foo', { is: def });
            assert.deepEqual(rect, {
                bottom: 0,
                height: 0,
                left: 0,
                right: 0,
                top: 0,
                width: 0,
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

        describe('integration', () => {

            it('should support outer className', () => {
                let vnode;
                const def = class MyComponent extends Element {}
                const elm = document.createElement('x-foo');
                vnode = api.c('x-foo', def, { className: 'foo' });
                patch(elm, vnode);
                assert.equal(elm.className, 'foo');
            });

            it('should support outer classMap', () => {
                let vnode;
                const def = class MyComponent extends Element {}
                const elm = document.createElement('x-foo');
                vnode = api.c('x-foo', def, { classMap: { foo: 1 } });
                patch(elm, vnode);
                assert.equal(elm.className, 'foo');
            });

            it('should combine inner classes first and then data.className', () => {
                let vnode;
                const def = class MyComponent extends Element {
                    constructor() {
                        super();
                        this.classList.add('foo');
                    }
                }
                const elm = document.createElement('x-foo');
                vnode = api.c('x-foo', def, { className: 'bar  baz' });
                patch(elm, vnode);
                assert.equal(elm.className, 'bar baz foo');
            });

            it('should not allow deleting outer classes from within', () => {
                let vnode;
                const def = class MyComponent extends Element {
                    constructor() {
                        super();
                        this.classList.remove('foo');
                    }
                }
                const elm = document.createElement('x-foo');
                vnode = api.c('x-foo', def, { className: 'foo' });
                patch(elm, vnode);
                assert.equal(elm.className, 'foo');
            });

            it('should dedupe all classes', () => {
                let vnode;
                const def = class MyComponent extends Element {
                    constructor() {
                        super();
                        this.classList.add('foo');
                    }
                }
                const elm = document.createElement('x-foo');
                vnode = api.c('x-foo', def, { className: 'foo   foo' });
                patch(elm, vnode);
                assert.equal(elm.className, 'foo');
            });

            it('should combine outer classMap and inner classes', () => {
                let vnode;
                const def = class MyComponent extends Element {
                    constructor() {
                        super();
                        this.classList.add('foo');
                    }
                }
                const elm = document.createElement('x-foo');
                vnode = api.c('x-foo', def, { classMap: { bar: 1 } });
                patch(elm, vnode);
                assert.equal(elm.className, 'bar foo');
            });

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
            let o = { foo: 1 };
            let x = { bar: 2 };
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.state = o;
                    this.state = x;
                    this.state.baz = 3;
                    state = this.state;
                }
            }
            createElement('x-foo', { is: def });
            assert.deepEqual(state, { foo: undefined, bar: 2, baz: 3 }, 'deep structure');
            assert.notEqual(state, x, 'proxified state object');
            assert("baz" in x === false, 'invalid mutation of a source object');
            assert("bar" in o === false, 'invalid mutation of a source object');
        });
        it('should accept member properties', () => {
            let state;
            let o = { foo: 1 };
            const def = class MyComponent extends Element {
                constructor() {
                    super();
                    this.state.x = 1;
                    this.state.y = o;
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

});
