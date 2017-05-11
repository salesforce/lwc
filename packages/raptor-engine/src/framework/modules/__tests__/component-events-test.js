import assert from 'power-assert';
import { c } from "../../api.js";
import { patch } from "../../patch.js";
import { Element } from "../../html-element.js";

describe('module/component-events.js', () => {

    describe('for vm with internal event logic', () => {

        var elm, vnode0;

        beforeEach(function() {
            elm = document.createElement('x-foo');
            vnode0 = elm;
        });

        it('attaches click event handler to custom element from within (wc-compat)', function() {
            var result = [];
            function clicked(ev) { result.push(ev); }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked);
                }
            }
            var vnode = c('x-foo', Foo, {});
            elm = patch(vnode0, vnode).elm;
            elm.click();
            assert.equal(1, result.length);
        });

        it('should dispatch internal listeners first', function() {
            var result = [];
            function clicked1() { result.push(1); }
            function clicked2() { result.push(2); }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked1);
                }
            }
            var vnode = c('x-foo', Foo, {on: {click: clicked2}});
            elm = patch(vnode0, vnode).elm;
            elm.click();
            assert.deepEqual([1, 2], result);
        });

        it('should preserve behavior of stopimmidiatepropagation() for internal listeners', function() {
            var result = [];
            function clicked1(ev) { result.push(1); ev.stopImmediatePropagation(); }
            function clicked2() { throw new Error('should never reach this listener') }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked1);
                    this.addEventListener('click', clicked2);
                }
            }
            var vnode = c('x-foo', Foo, {});
            elm = patch(vnode0, vnode).elm;
            elm.click();
            assert.deepEqual([1], result);
        });

        it('should preserve behavior of stopimmidiatepropagation() for external listeners', function() {
            var result = [];
            function clicked1(ev) { result.push(1); ev.stopImmediatePropagation(); }
            function clicked2() { throw new Error('should never reach this listener') }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked1);
                }
            }
            var vnode = c('x-foo', Foo, {on: {click: clicked2}});
            elm = patch(vnode0, vnode).elm;
            elm.click();
            assert.deepEqual([1], result);
        });

        it('attaches custom event handler to custom element from within (wc-compat)', function() {
            var result = [];
            function tested(ev) { result.push(ev); }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('test', tested);
                }
            }
            var vnode = c('x-foo', Foo, {});
            elm = patch(vnode0, vnode).elm;
            elm.dispatchEvent(new CustomEvent('test', {}));
            assert.equal(1, result.length);
        });

        it('should expose component as context to the event handler when defined from within (wc-compat)', function() {
            var result = [];
            function clicked() { result.push(this); result.push.apply(result, arguments); }
            class Foo extends Element {
                constructor() {
                    super();
                    this.addEventListener('click', clicked);
                }
            }
            var vnode1 = c('x-foo', Foo, {});
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            assert.equal(2, result.length);
            assert.equal(vnode1.vm.component, result[0]); // context must be the component
            assert.equal(true, result[1] instanceof Event);
        });

    });

});
