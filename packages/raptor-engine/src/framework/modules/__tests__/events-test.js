import assert from 'power-assert';
import { h, c } from "../../api.js";
import { patch } from "../../patch.js";
import { Element } from "../../html-element.js";

describe('module/events.js', () => {

    describe('from snabbdom', () => {

        var elm, vnode0;

        beforeEach(function() {
            elm = document.createElement('div');
            vnode0 = elm;
        });

        it('attaches click event handler to element', function() {
            var result = [];
            function clicked(ev) { result.push(ev); }
            var vnode = h('div', {on: {click: clicked}}, [
                h('a', {}, ['Click my parent']),
            ]);
            elm = patch(vnode0, vnode).elm;
            elm.click();
            assert.equal(1, result.length);
        });

        it('does not attach new listener', function() {
            var result = [];
            var vnode1 = h('div', {on: {click: function() { result.push(1); }}}, [
                h('a', {}, ['Click my parent']),
            ]);
            var vnode2 = h('div', {on: {click: function() { result.push(2); }}}, [
                h('a', {}, ['Click my parent']),
            ]);
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            elm = patch(vnode1, vnode2).elm;
            elm.click();
            assert.deepEqual(result, [1, 2]);
        });

        it('detach attached click event handler to element', function() {
            var result = [];
            function clicked(ev) { result.push(ev); }
            var vnode1 = h('div', {on: {click: clicked}}, [
                h('a', {}, ['Click my parent']),
            ]);
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            assert.equal(1, result.length);
            var vnode2 = h('div', {on: {}}, [
                h('a', {}, ['Click my parent']),
            ]);
            elm = patch(vnode1, vnode2).elm;
            elm.click();
            assert.equal(1, result.length);
        });

        it('must not expose the virtual node to the event handler', function() {
            var result = [];
            function clicked() { result.push(this); result.push.apply(result, arguments); }
            var vnode1 = h('div', {on: {click: clicked }}, [
                h('a', {}, ['Click my parent']),
            ]);
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            assert.equal(2, result.length);
            assert.equal(undefined, result[0]); // context must be undefined
            assert.equal(true, result[1] instanceof Event);
        });

        it('shared handlers in parent and child nodes', function() {
            var result = [];
            var sharedHandlers = {
                click: function(ev) { result.push(ev); }
            };
            var vnode1 = h('div', {on: sharedHandlers}, [
                h('a', {on: sharedHandlers}, ['Click my parent']),
            ]);
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            assert.equal(1, result.length);
            elm.firstChild.click();
            assert.equal(3, result.length);
        });

        it('rewrite listener on the same node', function() {
            var result = [];
            function onClick1() { result.push(1); }
            function onClick2() { result.push(2); }
            var on = {click: onClick1 };
            var vnode1 = h('div', {on}, ['Click']);
            patch(vnode0, vnode1);
            var vnode2 = h('div', {on}, ['Click']);
            patch(vnode1, vnode2);
            var vnode3 = h('div', {on: {click: onClick2}}, ['Click']);
            elm = patch(vnode2, vnode3).elm;
            elm.click();
            assert.equal(1, result.length);
        });

    });

    describe('for vm', () => {

        var elm, vnode0;

        beforeEach(function() {
            elm = document.createElement('x-foo');
            vnode0 = elm;
        });

        it('attaches click event handler to custom element', function() {
            var result = [];
            class Foo extends Element {}
            function clicked(ev) { result.push(ev); }
            var vnode = c('x-foo', Foo, {on: {click: clicked}});
            elm = patch(vnode0, vnode).elm;
            elm.click();
            assert.equal(1, result.length);
        });

        it('attaches custom event handler to custom element', function() {
            var result = [];
            class Foo extends Element {}
            function tested(ev) { result.push(ev); }
            var vnode = c('x-foo', Foo, {on: {test: tested}});
            elm = patch(vnode0, vnode).elm;
            elm.dispatchEvent(new CustomEvent('test', {}));
            assert.equal(1, result.length);
        });

        it('must not expose the vnode, vm or component to the event handler', function() {
            var result = [];
            class Foo extends Element {}
            function clicked() { result.push(this); result.push.apply(result, arguments); }
            var vnode1 = c('x-foo', Foo, {on: {click: clicked}});
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            assert.equal(2, result.length);
            assert.equal(undefined, result[0]); // context must be undefined
            assert.equal(true, result[1] instanceof Event);
        });

    });

    describe('for vm with internal logic', () => {

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
