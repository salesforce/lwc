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
                    experimentalDynamicComponent: {
                        loader,
                        strictSpecifier,
                    },
                }).code;
            };

            if (strictSpecifier && !isStrict) {
                expect(callback).toThrowError(/INVALID_DYNAMIC_IMPORT_SOURCE_STRICT/);
                return;
            } else {
                callback();
            }

            const imports = parse(code!)[0];

            const expectedImports = expect.arrayContaining([
                expect.objectContaining({
                    n: 'myLoader',
                }),
            ]);

            if (loader) {
                expect(imports).toEqual(expectedImports);
            } else {
                expect(imports).not.toEqual(expectedImports);
            }
        }
    );
});
