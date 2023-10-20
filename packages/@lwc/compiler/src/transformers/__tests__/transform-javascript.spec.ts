/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { noop } from '@lwc/shared';
import { TransformOptions } from '../../options';
import { transform, transformSync } from '../transformer';

const TRANSFORMATION_OPTIONS: TransformOptions = {
    namespace: 'x',
    name: 'foo',
};

function stripWhitespace(string: string) {
    return string.replace(/\s/g, '');
}

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

describe('object rest spread', () => {
    [59, 60].forEach((apiVersion) => {
        it(`apiVersion=${apiVersion}`, async () => {
            const actual = `
                export const test = { ...a, b: 1 }
            `;
            const { code } = await transform(actual, 'foo.js', {
                ...TRANSFORMATION_OPTIONS,
                apiVersion,
            });

            expect(code).toContain('b: 1');
            if (apiVersion === 59) {
                expect(code).not.toContain('...a');
            } else {
                expect(code).toContain('...a');
            }
        });
    });
});

it('should apply babel plugins when Lightning Web Security is on', async () => {
    const actual = `
        export const test = window.location.href;
        export async function foo() {
            await bar();
        }
        async function* baz() {
            yield 1;
            yield 2;
        }
        (async function() {
            for await (const num of baz()) {
                break;
            }
        })();
    `;

    const { code } = await transform(actual, 'foo.js', {
        ...TRANSFORMATION_OPTIONS,
        enableLightningWebSecurityTransforms: true,
    });

    expect(stripWhitespace(code)).toContain(
        stripWhitespace(
            '(window === globalThis || window === document ? location : window.location).href'
        )
    );
    expect(code).toContain('_asyncToGenerator');
    expect(code).toContain('_wrapAsyncGenerator');
    expect(code).toContain('_asyncIterator');
});

it('should not apply babel plugins when Lightning Web Security is off', async () => {
    const actual = `
        export const test = window.location.href;
        export async function foo() {
            await bar();
        }
        async function* baz() {
            yield 1;
            yield 2;
        }
        (async function() {
            for await (const num of baz()) {
                break;
            }
        })();
    `;
    const { code } = await transform(actual, 'foo.js', TRANSFORMATION_OPTIONS);
    expect(stripWhitespace(code)).toMatch(stripWhitespace(actual));
});

describe('instrumentation', () => {
    it('should gather metrics for transforming dynamic imports', async () => {
        const incrementCounter = jest.fn();
        const actual = `
            export async function test() {
                const x = await import("foo");
                const y = await import("bar");
                const z = await import("baz");
                return x + y + z + "yay";
            }
        `;
        await transform(actual, 'foo.js', {
            ...TRANSFORMATION_OPTIONS,
            experimentalDynamicComponent: {
                loader: '@custom/loader',
                strictSpecifier: true,
            },
            instrumentation: {
                log: noop,
                incrementCounter,
            },
        });

        const calls = incrementCounter.mock.calls;
        expect(calls).toHaveLength(3);
        expect(calls[0][0]).toBe('dynamic-import-transform');
        expect(calls[1][0]).toBe('dynamic-import-transform');
        expect(calls[2][0]).toBe('dynamic-import-transform');
    });
});

describe('unnecessary registerDecorators', () => {
    it('should provide helpful error for decorator outside of LightningElement, apiVersion=latest', () => {
        const actual = `
            import { track } from 'lwc'
            class Foo {
              @track bar = 'baz';
            }
        `;
        let error;
        try {
            transformSync(actual, 'foo.js', {
                ...TRANSFORMATION_OPTIONS,
            });
        } catch (err) {
            error = err;
        }

        expect(error).not.toBeUndefined();
        expect((error as any).message).toContain(
            'Decorators like @api, @track, and @wire are only supported in LightningElement classes.'
        );
    });

    it('should not customize the error message for non-@track/@wire/@api decorators, apiVersion=latest', () => {
        const actual = `
            const thisIsNotASupportedDecorator = {};
            class Foo {
              @thisIsNotASupportedDecorator bar = 'baz';
            }
        `;
        let error;
        try {
            transformSync(actual, 'foo.js', {
                ...TRANSFORMATION_OPTIONS,
            });
        } catch (err) {
            error = err;
        }

        expect(error).not.toBeUndefined();
        expect((error as any).message).not.toContain(
            'Decorators like @api, @track, and @wire are only supported in LightningElement classes.'
        );
    });

    it('should allow decorator outside of LightningElement, apiVersion=59', () => {
        const actual = `
            import { track } from 'lwc'
            class Foo {
              @track bar = 'baz';
            }
        `;
        const { code } = transformSync(actual, 'foo.js', {
            ...TRANSFORMATION_OPTIONS,
            apiVersion: 59,
        });
        expect(code).toContain('registerDecorators');
    });
});
