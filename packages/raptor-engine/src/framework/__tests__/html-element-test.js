import { Element } from "../html-element.js";
import { createElement } from "../upgrade.js";
import assert from 'power-assert';

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

});
