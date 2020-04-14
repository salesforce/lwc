/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compileToFunction } from '../index';

function mockRenderApi() {
    let id = 0;
    const calls = [];

    const mock = (name) => (...args) => {
        id++;

        calls.push([`${name}#${id}`, args]);
        return `#${id}`;
    };

    const apis = {
        t: mock('api_text'),
        h: mock('api_element'),
        c: mock('api_component'),
    };

    return {
        calls,
        apis,
    };
}

it('should throw on invalid template', () => {
    expect(() => {
        compileToFunction(`
            <template>1</template>
            <template>2</template>
        `);
    }).toThrowError('LWC1075: Multiple roots found');
});

it('should throw if template contains a style tag', () => {
    expect(() => {
        compileToFunction(`
            <template>
                <style>
                    div { color: red; }
                </style>
            </template>
        `);
    }).toThrowError(
        "LWC1122: The <style> element is disallowed inside the template. Please add css rules into '.css' file of your component bundle."
    );
});

it('should compile correctly simple components', () => {
    const { calls, apis } = mockRenderApi();

    const renderFn = compileToFunction(`
        <template>
            <div>
                <p>Hello</p>
                <p>world!</p>
            </div>
        </template>
    `);
    renderFn({})(apis);

    expect(calls).toMatchObject([
        ['api_text#1', ['Hello']],
        ['api_element#2', ['p', { key: expect.any(Number) }, ['#1']]],
        ['api_text#3', ['world!']],
        ['api_element#4', ['p', { key: expect.any(Number) }, ['#3']]],
        ['api_element#5', ['div', { key: expect.any(Number) }, ['#2', '#4']]],
    ]);
});

it('should look up for rendering a component', () => {
    const { calls, apis } = mockRenderApi();

    class XFoo {}
    const modules = { 'x-foo': XFoo };

    const renderFn = compileToFunction(`
        <template>
            <x-foo></x-foo>
        </template>
    `);

    renderFn(modules)(apis);

    expect(calls).toMatchObject([
        ['api_component#1', ['x-foo', XFoo, { key: expect.any(Number) }, []]],
    ]);
});

it('should should attach template metadata', () => {
    const renderFn = compileToFunction(`
        <template>
            <slot name="foo"></slot>
        </template>
    `);
    const tmpl = renderFn({});

    expect(tmpl.slots).toEqual(['foo']);
});
