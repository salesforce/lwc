/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { noop } from '@lwc/shared';
import { describe, expect, it, vi } from 'vitest';
import { transform, transformSync } from '../transformer';
import type { TransformOptions } from '../../options';
import '../../../scripts/test/types';

const BASE_TRANSFORM_OPTIONS: TransformOptions = {
    namespace: 'x',
    name: 'foo',
};

function stripWhitespace(string: string) {
    return string.replace(/\s/g, '');
}

it('should throw when processing an invalid javascript file', async () => {
    await expect(transform(`const`, 'foo.js', BASE_TRANSFORM_OPTIONS)).rejects.toMatchObject({
        filename: 'foo.js',
        message: expect.stringContaining('foo.js: Unexpected token (1:5)'),
    });
});

it('should apply transformation for valid javascript file', async () => {
    const actual = `
        import { LightningElement } from 'lwc';
        export default class Foo extends LightningElement {}
    `;
    const { code } = await transform(actual, 'foo.js', BASE_TRANSFORM_OPTIONS);

    expect(code).toMatch(/import \w+ from "\.\/foo.html";/);
    expect(code).toContain('registerComponent');
});

it('should transform class fields', async () => {
    const actual = `
        export class Test {
            foo;
        }
    `;
    const { code } = await transform(actual, 'foo.js', BASE_TRANSFORM_OPTIONS);

    expect(code).not.toContain('foo;');
});

describe('object rest spread', () => {
    [59, 60].forEach((apiVersion) => {
        it(`apiVersion=${apiVersion}`, async () => {
            const actual = `
                export const test = { ...a, b: 1 }
            `;
            const { code } = await transform(actual, 'foo.js', {
                ...BASE_TRANSFORM_OPTIONS,
                apiVersion,
            });

            expect(code).toContain('b: 1');
            const shouldContainSpread = apiVersion !== 59;
            expect(code.includes('...a')).toBe(shouldContainSpread);
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
        ...BASE_TRANSFORM_OPTIONS,
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
    const { code } = await transform(actual, 'foo.js', BASE_TRANSFORM_OPTIONS);
    expect(stripWhitespace(code)).toMatch(stripWhitespace(actual));
});

describe('instrumentation', () => {
    it('should gather metrics for transforming dynamic imports', async () => {
        const incrementCounter = vi.fn();
        const actual = `
            export async function test() {
                const x = await import("foo");
                const y = await import("bar");
                const z = await import("baz");
                return x + y + z + "yay";
            }
        `;
        await transform(actual, 'foo.js', {
            ...BASE_TRANSFORM_OPTIONS,
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
                ...BASE_TRANSFORM_OPTIONS,
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
                ...BASE_TRANSFORM_OPTIONS,
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
            ...BASE_TRANSFORM_OPTIONS,
            apiVersion: 59,
        });
        expect(code).toContain('registerDecorators');
    });
});

describe('sourcemaps', () => {
    it("should generate inline sourcemaps when the output config includes the 'inline' option for sourcemaps", () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {}
        `;

        const { code, map } = transformSync(source, 'foo.js', {
            ...BASE_TRANSFORM_OPTIONS,
            outputConfig: {
                sourcemap: 'inline',
            },
        });
        expect(code).toContain('//# sourceMappingURL=data:application/json;');
        expect(map).toBeNull();
    });

    it("should generate sourcemaps when the sourcemap configuration value is 'true'", () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {}
        `;

        const { map } = transformSync(source, 'foo.js', {
            ...BASE_TRANSFORM_OPTIONS,
            outputConfig: {
                sourcemap: true,
            },
        });
        expect(map).not.toBeNull();
    });

    describe("should fail validation of options if sourcemap configuration value is neither boolean nor 'inline'.", () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {}
        `;

        it.for([
            { name: 'invalid string', sourcemap: 'invalid' },
            { name: 'object', sourcemap: {} },
            { name: 'numbers', sourcemap: 123 },
        ])('$name', ({ sourcemap }) => {
            expect(() =>
                transformSync(source, 'foo.js', {
                    ...BASE_TRANSFORM_OPTIONS,
                    outputConfig: {
                        // @ts-expect-error Property can be passed from JS environments with no type checking.
                        sourcemap,
                    },
                })
            ).toThrow(
                `LWC1021: Expected a boolean value or 'inline' for outputConfig.sourcemap, received "${sourcemap}".`
            );
        });
    });
});

describe('file extension support', () => {
    function testFileExtensionSupport(ext: string) {
        it(`should support ${ext} file extension`, () => {
            const src = `
                import { LightningElement } from 'lwc';
                export default class Foo extends LightningElement {}
            `;
            const options = { namespace: 'c', name: 'foo' };
            const result = transformSync(src, `foo${ext}`, options);
            expect(result.code).toBeDefined();
            expect(result.map).toBeDefined();
            expect(result.warnings).toBeUndefined();
            expect(result.cssScopeTokens).toBeUndefined();
        });
    }
    ['.js', '.jsx', '.ts', '.tsx'].forEach(testFileExtensionSupport);
});

describe('errorRecoveryMode', () => {
    const TRANSFORM_OPTIONS = {
        ...BASE_TRANSFORM_OPTIONS,
        experimentalErrorRecoveryMode: true,
    };

    it('should return code when compiled successfully', () => {
        const actual = `
            import { LightningElement } from 'lwc';
            export default class Foo extends LightningElement {}
        `;
        const { code } = transformSync(actual, 'foo.js', TRANSFORM_OPTIONS);

        expect(code).toMatch(/import \w+ from "\.\/foo.html";/);
        expect(code).toContain('registerComponent');
    });

    it('should throw an AggregateError when errors are present', () => {
        const actual = `
                import { LightningElement, api } from 'lwc';
                export default class Foo extends LightningElement {
                    // Error 1: Invalid property name with numbers (1107 - PROPERTY_NAME_CANNOT_START_WITH_DATA)
                    @api dataInvalidProperty;
                }
            `;

        expect(() => {
            transformSync(actual, 'foo.js', TRANSFORM_OPTIONS);
        }).toThrowAggregateError(['LWC1107: Invalid property name "dataInvalidProperty".']);
    });

    it('should return multiple errors when present', () => {
        const actual = `
            import { LightningElement, api, track, wire } from 'lwc';
            export default class Foo extends LightningElement {
                // Error 1: Property name starting with "on" (1108 - PROPERTY_NAME_CANNOT_START_WITH_ON)
                @api onClickHandler;
                
                // Error 2: Reserved property name (1110 - PROPERTY_NAME_IS_RESERVED)
                @api class;
                
                // Error 3: Track decorator on non-class property (1113 - TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES)
                @track someMethod() { return 'invalid'; }

                // Error 4: Wire adapter should be imported (1119 - WIRE_ADAPTER_SHOULD_BE_IMPORTED)
                @wire(undefinedAdapter, {}) wiredWithUndefinedAdapter;
            }`;
        expect(() => {
            transformSync(actual, 'foo.js', TRANSFORM_OPTIONS);
        }).toThrowAggregateError([
            'LWC1108: Invalid property name "onClickHandler". Properties starting with "on" are reserved for event handlers.',
            'LWC1110: Invalid property name "class". "class" is a reserved attribute.',
            'LWC1119: Failed to resolve @wire adapter "undefinedAdapter". Ensure it is imported.',
            'LWC1113: @track decorator can only be applied to class properties.',
        ]);
    });
});
