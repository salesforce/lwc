import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { compileComponentForSSR } from '../index';

describe('component compilation', () => {
    test('implicit templates imports do not use full file paths', () => {
        const src = `
        import { LightningElement } from 'lwc';
        export default class extends LightningElement {}
        `;
        const filename = path.resolve('component.js');
        const { code } = compileComponentForSSR(src, filename, {});
        expect(code).toContain('import tmpl from "./component.html"');
    });
    test('explicit templates imports do not use full file paths', () => {
        const src = `
        import { LightningElement } from 'lwc';
        import explicit from './explicit.html';
        export default class extends LightningElement {}
        `;
        const filename = path.resolve('component.js');
        const { code } = compileComponentForSSR(src, filename, {});
        expect(code).toContain('import explicit from "./explicit.html"');
    });
    test('supports .ts file imports', () => {
        const src = `
            import { LightningElement } from 'lwc';
            export default class extends LightningElement {}
        `;
        const filename = path.resolve('component.ts');
        const { code } = compileComponentForSSR(src, filename, {});
        expect(code).toContain('import tmpl from "./component.html"');
    });
});
