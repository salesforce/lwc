/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { TransformOptions } from '../../options';
import { transform, transformSync } from '../transformer';

const TRANSFORMATION_OPTIONS: TransformOptions = {
    namespace: 'x',
    name: 'foo',
};

it('should throw when processing an invalid javascript file', async () => {
    await expect(transform(`const`, 'foo.js', TRANSFORMATION_OPTIONS)).rejects.toMatchObject({
        filename: 'foo.js',
        message: expect.stringContaining('foo.js: Unexpected token (1:5)'),
    });
});

it('should apply transformation for valid javascript file', async () => {
    const actual = `
        import { LightningElement } from 'lwc';
        export default class Foo extends LightningElement {}
    `;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);

    expect(code).toMatch(/import \w+ from "\.\/foo.html";/);
    expect(code).toContain('registerComponent');
});

it('should transform class fields', async () => {
    const actual = `
        export class Test {
            foo;
        }
    `;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);

    expect(code).not.toContain('foo;');
});

it('should object spread', async () => {
    const actual = `
        export const test = { ...a, b: 1 }
    `;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);

    expect(code).toContain('b: 1');
    expect(code).not.toContain('...a');
});

describe('should transform TypeScript file correctly', () => {
    function transformTSCodeAndVerify(actual: string, verifyExcludeString: string): string {
        const { code, map, warnings } = transformSync(actual, 'foo.ts', {
            ...TRANSFORMATION_OPTIONS,
            outputConfig: { sourcemap: true },
        });
        expect(code).toMatch(/import \w+ from "\.\/foo.html";/);
        expect(code).toContain('registerComponent');
        expect(code).toContain('registerDecorators');
        expect(code).not.toContain(verifyExcludeString);
        expect(map).not.toBeNull();
        expect(warnings).toBeUndefined();

        return code;
    }

    it('should work for simple TypeScript file', () => {
        const actual = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {
                greeting?: string = 'hello world';
            }
        `;
        transformTSCodeAndVerify(actual, '?');
    });

    it('should work for Interfaces', () => {
        const actual = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {
                config?: SquareConfig = { color: 'blue', width: 6 };
            }
            export interface SquareConfig {
                color?: string;
                width?: number;
            }
        `;
        transformTSCodeAndVerify(actual, 'interface');
    });

    it('should work for Enum', () => {
        const actual = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {
                direction?: Direction = Direction.Up;
            }
            export enum Direction {
                Up = "UP",
                Down = "DOWN",
                Left = "LEFT",
                Right = "RIGHT",
            }
        `;
        transformTSCodeAndVerify(actual, 'enum');
    });

    it('should work for type assersion', () => {
        const actual = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {
                baz: Baz = {} as Baz;
                connectedCallback(): void {
                    this.baz.bar = 123;
                    this.baz.bas = 'hello';
                }
            }
            interface Baz {
                bar: number;
                bas: string;
            }
        `;
        transformTSCodeAndVerify(actual, 'Baz');
    });

    it('should work for generic type', () => {
        const actual = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {
                output:string = '';
                connectedCallback(): void {
                    this.output = this.identity<string>("myString");
                }
            
                identity<Type>(arg: Type): Type {
                    return arg;
                }
            }
        `;
        transformTSCodeAndVerify(actual, '<Type>');
    });

    it('should work for decorators', () => {
        const actual = `
            import { LightningElement, api, track } from 'lwc';
            export default class Foo extends LightningElement {
                @api bar?: string;
                @track baz?: { color: number };
            }
        `;
        const code = transformTSCodeAndVerify(actual, 'color');
        expect(code).toContain('publicProps');
    });

    it('should still transform when a teyp error exist', () => {
        const actual = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {
                carYear: number;
                connectedCallback(): void {
                    this.carYear = 'a string';
                }
            }
        `;
        transformTSCodeAndVerify(actual, 'number');
    });

    it('should work for type-only imports', () => {
        const actual = `
            import { LightningElement } from 'lwc';
            import type { SomeThing } from "./some-module.js";
            export default class Foo extends LightningElement {
                someThing: SomeThing;
            }
        `;
        transformTSCodeAndVerify(actual, 'import type');
    });
});
