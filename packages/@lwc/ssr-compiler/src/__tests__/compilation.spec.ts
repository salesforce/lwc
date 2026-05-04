import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { CompilerError, DecoratorErrors } from '@lwc/errors';
import { LWC_VERSION_COMMENT_REGEX } from '@lwc/shared';
import { compileComponentForSSR, compileTemplateForSSR } from '../index';

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
        expect(code).toContain('import __lwcTmpl from "./component.html"');
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
    test('components include LWC version comment', () => {
        const src = `
      import { LightningElement } from 'lwc';
      export default class extends LightningElement {}
      `;
        const filename = path.resolve('component.js');
        const { code } = compileComponentForSSR(src, filename, {});
        expect(code).toMatch(LWC_VERSION_COMMENT_REGEX);
    });
    test('supports .ts file imports', () => {
        const src = `
            import { LightningElement } from 'lwc';
            export default class extends LightningElement {}
        `;
        const filename = path.resolve('component.ts');
        const { code } = compileComponentForSSR(src, filename, {});
        expect(code).toContain('import __lwcTmpl from "./component.html"');
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
                      "length": 77,
                      "line": 6,
                      "start": 220,
                    },
                    "message": "LWC1200: Computed property in @wire config must be a constant or primitive literal.",
                  }
                `);
        });

        test('throws when @wire is called with no arguments', () => {
            const src = `import { wire, LightningElement } from "lwc";
export default class Test extends LightningElement {
  @wire()
  wiredFoo;
}
`;
            expect(() => compileComponentForSSR(src, 'test.js', {})).toThrow(
                expect.objectContaining({
                    code: DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER.code,
                })
            );
        });

        test('throws when @wire adapter uses a computed member expression', () => {
            const src = `import { wire, LightningElement } from "lwc";
import { adapters } from "data-service";
export default class Test extends LightningElement {
  @wire(adapters["getFoo"])
  wiredFoo;
}
`;
            expect(() => compileComponentForSSR(src, 'test.js', {})).toThrow(
                expect.objectContaining({
                    code: DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS.code,
                })
            );
        });

        test('throws when @wire adapter is a nested member expression', () => {
            const src = `import { wire, LightningElement } from "lwc";
import { adapters } from "data-service";
export default class Test extends LightningElement {
  @wire(adapters.getters.getFoo)
  wiredFoo;
}
`;
            expect(() => compileComponentForSSR(src, 'test.js', {})).toThrow(
                expect.objectContaining({
                    code: DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS
                        .code,
                })
            );
        });

        test('throws when @wire adapter is a literal', () => {
            const src = `import { wire, LightningElement } from "lwc";
export default class Test extends LightningElement {
  @wire("not-an-identifier")
  wiredFoo;
}
`;
            expect(() => compileComponentForSSR(src, 'test.js', {})).toThrow(
                expect.objectContaining({
                    code: DecoratorErrors.FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER.code,
                })
            );
        });

        test('throws when @wire adapter references a non-module binding', () => {
            const src = `import { wire, LightningElement } from "lwc";
const getFoo = () => null;
export default class Test extends LightningElement {
  @wire(getFoo)
  wiredFoo;
}
`;
            expect(() => compileComponentForSSR(src, 'test.js', {})).toThrow(
                expect.objectContaining({
                    code: DecoratorErrors.COMPUTED_PROPERTY_MUST_BE_CONSTANT_OR_LITERAL.code,
                })
            );
        });

        test('throws when @wire config is not an object expression', () => {
            const src = `import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, 42)
  wiredFoo;
}
`;
            expect(() => compileComponentForSSR(src, 'test.js', {})).toThrow(
                expect.objectContaining({
                    code: DecoratorErrors.CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER.code,
                })
            );
        });

        test('throws when @wire config uses a template literal as a computed key', () => {
            const src = `import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, { [\`dynamic\`]: "$prop" })
  wiredFoo;
}
`;
            expect(() => compileComponentForSSR(src, 'test.js', {})).toThrow(
                expect.objectContaining({
                    code: DecoratorErrors.COMPUTED_PROPERTY_CANNOT_BE_TEMPLATE_LITERAL.code,
                })
            );
        });
    });
});

describe('template compilation', () => {
    test('template include LWC version comment', () => {
        const src = `<template></template>`;
        const filename = path.resolve('component.html');
        const { code } = compileTemplateForSSR(src, filename, {});
        expect(code).toMatch(LWC_VERSION_COMMENT_REGEX);
    });

    test('iterator directive resolves a nested member expression against the instance', () => {
        const src = `<template>
            <template iterator:it={items.nested.data}>
                <li key={it.value}>{it.value}</li>
            </template>
        </template>`;
        const { code } = compileTemplateForSSR(src, path.resolve('component.html'), {});
        expect(code).toContain('instance.items.nested.data');
    });
});
