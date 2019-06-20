/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { evaluateCSS } from '../stylesheet';
import { createElement, LightningElement } from '../main';
import { compileTemplate } from 'test-utils';
import { getComponentVM } from '../vm';
import * as utils from '../utils';

function createVmForTesting() {
    let vm;

    const html = compileTemplate(`<template></template>`);
    class VmRendering extends LightningElement {
        constructor() {
            super();
            vm = getComponentVM(this);
        }
        render() {
            return html;
        }
    }
    const elm = createElement('x-vm-aux', { is: VmRendering });
    document.body.appendChild(elm);

    return vm;
}

describe('stylesheet behavior', () => {
    describe('evalueteCSS', () => {
        it('should return vnode with clonedElement for reuse in native shadow', () => {
            const originalValue = utils.useSyntheticShadow;
            utils.useSyntheticShadow = false;

            const vm = createVmForTesting();

            const vnode = evaluateCSS(vm, [], 'x-vm-aux', '');

            utils.useSyntheticShadow = originalValue;
            expect(vnode.clonedElement).toBeDefined();
        });

        it('should not create vnode in synthetic shadow', () => {
            const originalValue = utils.useSyntheticShadow;
            utils.useSyntheticShadow = true;

            const vm = createVmForTesting();
            const vnode = evaluateCSS(vm, [], 'x-vm-aux', '');

            utils.useSyntheticShadow = originalValue;
            expect(vnode).toBeNull();
        });
    });
});
