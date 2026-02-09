import path from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { init, parse } from 'es-module-lexer';
import { compileComponentForSSR } from '../index';

describe('dynamic imports', () => {
    type CompileOptions = {
        strictSpecifier: boolean;
        loader: undefined | string;
        isStrict: boolean;
    };

    beforeAll(async () => {
        await init;
    });

    // Generate all possible combinations of options
    const combinations = [false, true]
        .map((strictSpecifier) =>
            [undefined, 'myLoader'].map((loader) =>
                [false, true].map((isStrict) => ({
                    strictSpecifier,
                    loader,
                    isStrict,
                }))
            )
        )
        .flat(Infinity) as Array<CompileOptions>;

    test.each(combinations)(
        'strictSpecifier=$strictSpecifier, loader=$loader, isStrict=$isStrict',
        ({ strictSpecifier, loader, isStrict }: CompileOptions) => {
            const source = `
                import { LightningElement } from 'lwc';
                export default class extends LightningElement {}
                export default async function rando () {
                    await import(${isStrict ? '"x/foo"' : 'woohoo'});
                }
            `;
            const filename = path.resolve('component.js');
            let code;

            const callback = () => {
                code = compileComponentForSSR(source, filename, {
                    dynamicImports: {
                        loader,
                        strictSpecifier,
                    },
                }).code;
            };

            if (strictSpecifier && !isStrict) {
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(callback).toThrowError(/LWC1121/);
                return;
            } else {
                callback();
            }

            const imports = parse(code!)[0];

            const importsWithLoader = expect.arrayContaining([
                expect.objectContaining({
                    n: 'myLoader',
                }),
            ]);

            if (loader) {
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(imports).toEqual(importsWithLoader);
            } else {
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(imports).not.toEqual(importsWithLoader);
            }
        }
    );

    test('imports are hoisted only once', () => {
        const source = `
                import { LightningElement } from 'lwc';
                export default class extends LightningElement {}
                export default async function rando () {
                    await import('x/foo');
                    await import('x/bar');
                    await import('x/baz');
                }
            `;
        const filename = path.resolve('component.js');
        const { code } = compileComponentForSSR(source, filename, {
            dynamicImports: {
                loader: 'myLoader',
                strictSpecifier: true,
            },
        });

        const imports = parse(code!)[0];

        expect(imports).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    n: 'myLoader',
                }),
            ])
        );

        // Validate that there is exactly one import of the loader
        expect(imports.filter((_) => _.n === 'myLoader')).toHaveLength(1);

        expect(code).toContain(`x/foo`);
        expect(code).toContain(`x/bar`);
        expect(code).toContain(`x/baz`);
    });
});
