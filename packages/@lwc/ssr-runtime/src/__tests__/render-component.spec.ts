import path from 'node:path';
import fs from 'node:fs/promises';
import { describe, beforeAll, test, expect } from 'vitest';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { renderComponent } from '../index';

interface ComponentModule {
    default: any;
    generateMarkup: any;
}

async function compileComponent({
    input,
    files,
}: {
    input: string;
    files: { [name: string]: string };
}) {
    const dirname = path.resolve(__dirname, 'dist/render-component');
    const modulesDir = path.resolve(dirname, './src');
    const outputFile = path.resolve(dirname, './dist/index.js');

    for (const [name, content] of Object.entries(files)) {
        const filename = path.join(modulesDir, name);
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, content, 'utf-8');
    }

    const bundle = await rollup({
        input: path.resolve(modulesDir, input),
        external: ['lwc', '@lwc/ssr-runtime'],
        plugins: [
            lwcRollupPlugin({
                targetSSR: true,
                modules: [{ dir: modulesDir }],
            }),
        ],
    });

    await bundle.write({
        file: outputFile,
        format: 'esm',
        exports: 'named',
    });

    return outputFile;
}

describe('renderComponent', () => {
    let module;

    beforeAll(async () => {
        const files = {
            'x/component/component.js': `
                import { LightningElement } from 'lwc';
                export default class extends LightningElement {}
            `,
            'x/component/component.html': `
                <template><h1>Hello world</h1></template>
            `,
        };
        const outputFile = await compileComponent({
            input: 'x/component/component.js',
            files,
        });

        module = (await import(outputFile)) as ComponentModule;
    });

    test('can call `renderComponent()` on the default export', async () => {
        const result = await renderComponent('x-component', module!.default, {});

        expect(result).toContain('<h1>Hello world</h1>');
    });

    test('does not throw if props are not provided', async () => {
        const result = await renderComponent('x-component', module!.default);

        expect(result).toContain('<h1>Hello world</h1>');
    });

    test('throws if tagName is not provided', async () => {
        await expect(() => renderComponent(undefined as any, module!.default, {})).rejects.toThrow(
            'tagName must be a string, found: undefined'
        );
    });
});
