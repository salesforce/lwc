/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/* tslint:disable:max-line-length */

import { parse } from '../';

function parseTemplate(src: string): any {
    return parse(src, {
        experimentalDataBindingAST: true,
    });
}

describe('binding ast parser', () => {
    it('simple without data', () => {
        const { root } = parseTemplate(`
            <template>
                <foo-bar></foo-bar>
            </template>
        `);
        expect(root.children).toHaveLength(1);
        const node = root.children[0];
        expect(node.tag).toBe('foo-bar');
        expect(node.attributes).toHaveLength(0);
    });

    it('simple with data', () => {
        const { root } = parseTemplate(`
            <template>
                <foo-bar microwave={oven}></foo-bar>
            </template>
        `);
        expect(root.children).toHaveLength(1);
        const node = root.children[0];
        expect(node.tag).toBe('foo-bar');
        expect(node.attributes).toHaveLength(1);
    });

    describe('for:each directive', () => {
        it('inline directive is lifted', () => {
            const { root: templateRoot } = parseTemplate(`
                <template>
                    <template for:each={items} for:item="item">
                        <foo-bar microwave={oven}></foo-bar>
                    </template>
                </template>
            `);
            const { root: inlineRoot } = parseTemplate(`
                <template>
                    <foo-bar for:each={items} for:item="item" microwave={oven}></foo-bar>
                </template>
            `);
            expect(inlineRoot).toEqual(templateRoot);
        });
    });

    describe('for:of directive', () => {
        it('inline directive is lifted', () => {
            const { root: templateRoot } = parseTemplate(`
                <template>
                    <template iterator:thing={items}>
                        <foo-bar microwave={thing.oven}></foo-bar>
                    </template>
                </template>
            `);
            const { root: inlineRoot } = parseTemplate(`
                <template>
                    <foo-bar iterator:thing={items} microwave={thing.oven}></foo-bar>
                </template>
            `);
            expect(inlineRoot).toEqual(templateRoot);
        });
    });

    describe('if directive', () => {
        it('inline directive is lifted', () => {
            const { root: templateRoot } = parseTemplate(`
                <template>
                    <template if:true={maybe}>
                        <foo-bar microwave={oven}></foo-bar>
                    </template>
                </template>
            `);
            const { root: inlineRoot } = parseTemplate(`
                <template>
                    <foo-bar if:true={maybe} microwave={oven}></foo-bar>
                </template>
            `);
            expect(inlineRoot).toEqual(templateRoot);
        });
    });
});
