/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import vm from 'vm';
import { parseFragment, serialize } from 'parse5';
import { rollup, RollupLog } from 'rollup';
import replace from '@rollup/plugin-replace';
import virtual from '@rollup/plugin-virtual';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import * as engineServer from '../index';

/**
 * The goal of these tests is to serialize the HTML, and then parse it with a real
 * HTML parser to ensure that the serialized content is correct. It's slightly more
 * robust than snapshots, which may have invalid/incorrect HTML.
 */

jest.setTimeout(10_000 /* 10 seconds */);

// Compile a component to an HTML string, using the full LWC compilation pipeline
async function compileComponent(tagName: string, componentName: string) {
    const modulesDir = path.resolve(__dirname, './modules');
    const componentPath = path.resolve(
        modulesDir,
        componentName,
        componentName.split('/')[1] + '.js'
    );

    const warnings: RollupLog[] = [];

    const bundle = await rollup({
        input: '__entry__',
        external: ['lwc'],
        onwarn(warning) {
            warnings.push(warning);
        },
        plugins: [
            virtual({
                __entry__: `
                  import { renderComponent } from 'lwc';
                  import Component from ${JSON.stringify(componentPath)};
                  export const component = renderComponent(${JSON.stringify(tagName)}, Component);
                `,
            }),
            lwcRollupPlugin({
                modules: [{ dir: modulesDir }],
            }),
            replace({
                preventAssignment: true,
                values: {
                    'process.env.NODE_ENV': '"development"',
                },
            }),
        ],
    });

    const { output } = await bundle.generate({
        globals: {
            lwc: 'lwc',
        },
        format: 'iife',
        name: 'result',
    });
    const { code } = output[0];

    const context = vm.createContext({
        lwc: engineServer,
    });
    vm.runInContext(code, context);
    const html = (context as any).result.component as string;

    return {
        html,
        warnings,
    };
}

// Parse the compiled HTML and re-serialize to validate it against a real HTML parser
function parseAndReserialize(html: string): string {
    const parsed = parseFragment(html);
    return serialize(parsed);
}

describe('html serialization', () => {
    it('serializes void HTML elements correctly', async () => {
        const { html, warnings } = await compileComponent('x-html-void', 'x/htmlVoid');
        const parsedHtml = parseAndReserialize(html);
        expect(parsedHtml).toEqual(
            '<x-html-void><input type="text" value="one"><input type="text" value="two"></x-html-void>'
        );
        expect(warnings.length).toEqual(0);
    });

    it('serializes void HTML elements correctly with text in between', async () => {
        const { html, warnings } = await compileComponent(
            'x-html-void-adjacent-text',
            'x/htmlVoidAdjacentText'
        );
        const parsedHtml = parseAndReserialize(html);
        expect(parsedHtml).toEqual(
            '<x-html-void-adjacent-text>before<input type="text" value="one">middle<input type="text" value="two">after</x-html-void-adjacent-text>'
        );
        expect(warnings.length).toEqual(0);
    });

    it('serializes SVG path elements correctly', async () => {
        const { html, warnings } = await compileComponent('x-svg-path', 'x/svgPath');
        const parsedHtml = parseAndReserialize(html);
        expect(parsedHtml).toEqual(
            '<x-svg-path><svg xmlns="http://www.w3.org/2000/svg"><path d="M10 10"></path><path d="M20 20"></path></svg></x-svg-path>'
        );
        expect(warnings.length).toEqual(0);
    });

    it('serializes void HTML elements correctly in HTML namespace', async () => {
        const { html, warnings } = await compileComponent(
            'x-html-void-html-namespace',
            'x/htmlVoidHtmlNamespace'
        );
        const parsedHtml = parseAndReserialize(html);
        expect(parsedHtml).toEqual(
            '<x-html-void-html-namespace><div xmlns="http://www.w3.org/1999/xhtml"><input type="text" value="one"><input type="text" value="two"></div></x-html-void-html-namespace>'
        );
        expect(warnings.map((_) => _.message)).toEqual([
            '@lwc/rollup-plugin: LWC1057: xmlns is not valid attribute for div. For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div',
        ]);
    });
});
