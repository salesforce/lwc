import { Metadata } from 'babel-plugin-transform-lwc-class';

import { CompilerOptions } from '../../compiler/options';
import { transform } from '../transformer';

import { pretify } from '../../__tests__/utils';

const COMPILER_OPTIONS: CompilerOptions = {
    namespace: 'x',
    name: 'foo',
    files: {},
};

it('should apply transformation for valid javascript file', async () => {
    const actual = `
        import { LightningElement } from 'lwc';
        export default class Foo extends LightningElement {}
    `;

    const expected = `
        import _tmpl from "./foo.html";
        import { registerComponent as _registerComponent } from "lwc";
        import { LightningElement } from 'lwc';
        class Foo extends LightningElement {}
        export default _registerComponent(Foo, {
            tmpl: _tmpl
        });
    `;

    const { code } = await transform(actual, 'foo.js', COMPILER_OPTIONS);
    expect(pretify(code)).toBe(pretify(expected));
});

it('outputs proper metadata', async () => {
    const content = `
        import { LightningElement, api } from 'lwc';
        /** Foo doc */
        export default class Foo extends LightningElement {
            _privateTodo;

            @api
            get todo () {
                return this._privateTodo;
            }
            set todo (val) {
                return this._privateTodo = val;
            }

            @api
            index;
        }
    `;

    const result = await transform(content, 'foo.js', COMPILER_OPTIONS);

    const metadata = result.metadata as Metadata;

    expect(metadata.decorators).toEqual([
        {
            type: 'api',
            targets: [
                { type: 'property', name: 'todo' },
                { type: 'property', name: 'index', value: { type: undefined, value: undefined } },
            ],
        },
    ]);
    expect(metadata.doc).toBe('* Foo doc');
    expect(metadata.declarationLoc).toEqual({
        start: { line: 4, column: 8 },
        end: { line: 17, column: 9 },
    });
});

it('should throw when processing an invalid javascript file', async () => {
    await expect(
        transform(`const`, 'foo.js', COMPILER_OPTIONS),
    ).rejects.toMatchObject({
        filename: 'foo.js',
        message: expect.stringContaining('foo.js: Unexpected token (1:5)'),
    });
});

it('allows dynamic imports', async () => {
    const actual = `
        export function test() {
            return import('/test');
        }
    `;

    const expected = `
        export function test() {
            return import('/test');
        }
    `;

    const { code } = await transform(actual, 'foo.js', COMPILER_OPTIONS);
    expect(pretify(code)).toBe(pretify(expected));
});
