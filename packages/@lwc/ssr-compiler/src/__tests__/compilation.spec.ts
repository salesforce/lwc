import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { CompilerError } from '@lwc/errors';
import { compileComponentForSSR } from '../index';

expect.addSnapshotSerializer({
    test(val) {
        return val instanceof CompilerError;
    },
    serialize(val: CompilerError, config, indentation, depth, refs, printer) {
        return printer(
            {
                message: val.message,
                location: val.location,
                filename: val.filename,
            },
            config,
            indentation,
            depth,
            refs
        );
    },
});

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

    describe('wire decorator', () => {
        test('error when using @wire and @track together', () => {
            const src = `import { track, wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @track
  @wire(getFoo, { key1: "$prop1", key2: ["fixed", "array"] })
  wiredWithTrack;
}
`;
            expect(() => compileComponentForSSR(src, 'test.js', {}))
                .toThrowErrorMatchingInlineSnapshot(`
          {
            "filename": "test.js",
            "location": {
              "column": 2,
              "length": 59,
              "line": 5,
              "start": 156,
            },
            "message": "LWC1095: @wire method or property cannot be used with @track",
          }
        `);
        });
        test('throws when wired method is combined with @api', () => {
            const src = `import { api, wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @api
  @wire(getFoo, { key1: "$prop1", key2: ["fixed"] })
  wiredWithApi() {}
}
`;

            expect(() => compileComponentForSSR(src, 'test.js', {}))
                .toThrowErrorMatchingInlineSnapshot(`
            {
              "filename": "test.js",
              "location": {
                "column": 2,
                "length": 50,
                "line": 5,
                "start": 152,
              },
              "message": "LWC1095: @wire method or property cannot be used with @api",
            }
          `);
        });
        test('throws when computed property is expression', () => {
            const src = `import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
const symbol = Symbol.for("key");
export default class Test extends LightningElement {
  // accidentally an array expression = oops!
  @wire(getFoo, { [[symbol]]: "$prop1", key2: ["fixed", "array"] })
  wiredFoo;
}
`;

            expect(() => compileComponentForSSR(src, 'test.js', {}))
                .toThrowErrorMatchingInlineSnapshot(`
              {
                "filename": "test.js",
                "location": {
                  "column": 2,
                  "length": 9,
                  "line": 7,
                  "start": 288,
                },
                "message": "LWC1200: Computed property in @wire config must be a constant or primitive literal.",
              }
            `);
        });
    });
});
