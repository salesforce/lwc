import { h, c, t } from "../../api";
import { patch } from "../../patch";
import { Element } from "../../html-element";

describe('module/events', () => {
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
                h('a', {}, [t('Click my parent')]),
            ]);
            elm = patch(vnode0, vnode).elm;
            elm.click();
            expect(result).toHaveLength(1);
        });

        it('does not attach new listener', function() {
            var result = [];
            var vnode1 = h('div', {on: {click: function() { result.push(1); }}}, [
                h('a', {}, [t('Click my parent')]),
            ]);
            var vnode2 = h('div', {on: {click: function() { result.push(2); }}}, [
                h('a', {}, [t('Click my parent')]),
            ]);
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            elm = patch(vnode1, vnode2).elm;
            elm.click();
            expect(result).toEqual([1, 2]);
        });

        it('detach attached click event handler to element', function() {
            var result = [];
            function clicked(ev) { result.push(ev); }
            var vnode1 = h('div', {on: {click: clicked}}, [
                h('a', {}, [t('Click my parent')]),
            ]);
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            expect(result).toHaveLength(1);
            var vnode2 = h('div', {on: {}}, [
                h('a', {}, [t('Click my parent')]),
            ]);
            elm = patch(vnode1, vnode2).elm;
            elm.click();
            expect(result).toHaveLength(1);
        });

        it('must not expose the virtual node to the event handler', function() {
            var result = [];
            function clicked() { result.push(this); result.push.apply(result, arguments); }
            var vnode1 = h('div', {on: {click: clicked }}, [
                h('a', {}, [t('Click my parent')]),
            ]);
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeUndefined(); // context must be undefined
            expect(result[1]).toBeInstanceOf(Event);
        });

        it('shared handlers in parent and child nodes', function() {
            var result = [];
            var sharedHandlers = {
                click: function(ev) { result.push(ev); }
            };
            var vnode1 = h('div', {on: sharedHandlers}, [
                h('a', {on: sharedHandlers}, [t('Click my parent')]),
            ]);
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            expect(result).toHaveLength(1);
            elm.firstChild.click();
            expect(result).toHaveLength(3);
        });

        it('rewrite listener on the same node', function() {
            var result = [];
            function onClick1() { result.push(1); }
            function onClick2() { result.push(2); }
            var on = {click: onClick1 };
            var vnode1 = h('div', {on}, [t('Click')]);
            patch(vnode0, vnode1);
            var vnode2 = h('div', {on}, [t('Click')]);
            patch(vnode1, vnode2);
            var vnode3 = h('div', {on: {click: onClick2}}, [t('Click')]);
            elm = patch(vnode2, vnode3).elm;
            elm.click();
            expect(result).toHaveLength(1);
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
            expect(result).toHaveLength(1);
        });

        it('attaches custom event handler to custom element', function() {
            var result = [];
            class Foo extends Element {}
            function tested(ev) { result.push(ev); }
            var vnode = c('x-foo', Foo, {on: {test: tested}});
            elm = patch(vnode0, vnode).elm;
            elm.dispatchEvent(new CustomEvent('test', {}));
            expect(result).toHaveLength(1);
        });

        it('must not expose the vnode, vm or component to the event handler', function() {
            var result = [];
            class Foo extends Element {}
            function clicked() { result.push(this); result.push.apply(result, arguments); }
            var vnode1 = c('x-foo', Foo, {on: {click: clicked}});
            elm = patch(vnode0, vnode1).elm;
            elm.click();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeUndefined(); // context must be undefined
            expect(result[1]).toBeInstanceOf(Event);
        });

    });

});
