/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import target from '../computed-class-attr';
import * as api from '../../api';
import { LightningElement } from '../../main';

describe('module/computed-class-attr', () => {
    it('should apply data.className', () => {
        const elm = document.createElement('p');
        const vnode = { elm, data: { className: 'foo' } };

        target.update({ data: {} }, vnode);
        expect(elm.className).toBe('foo');
    });

    it('should remove from oldData.className', () => {
        const elm = document.createElement('p');
        elm.className = 'baz manual';
        const vnode = { elm, data: { className: 'foo bar' } };

        target.update({ data: { className: 'baz' } }, vnode);
        expect(elm.className).toBe('manual foo bar');
    });

    it('should convert className to a classMap for custom elements', () => {
        const elm = document.createElement('p');
        class Foo extends LightningElement {}
        const vnode = api.c('x-foo', Foo, { className: 'foo' });
        vnode.elm = elm;
        target.update({ data: {} }, vnode);
        expect(elm.className).toBe('foo');
    });

    it('should split classNames on white spaces for custom elements', () => {
        const elm = document.createElement('p');
        class Foo extends LightningElement {}
        const vnode = api.c('x-foo', Foo, { className: 'foo bar   baz' });
        vnode.elm = elm;
        target.update({ data: {} }, vnode);
        expect(elm.className).toBe('foo bar baz');
    });

    it('should convert className to a classMap property for elements', () => {
        const elm = document.createElement('p');
        const vnode = api.h('p', { key: 0, className: 'foo' }, []);
        vnode.elm = elm;
        target.update({ data: {} }, vnode);
        expect(elm.className).toBe('foo');
    });

    it('should split classNames on white spaces for elements', () => {
        const elm = document.createElement('p');
        const vnode = api.h('p', { key: 0, className: 'foo bar   baz' }, []);
        vnode.elm = elm;
        target.update({ data: {} }, vnode);
        expect(elm.className).toBe('foo bar baz');
    });
});
