import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { compileComponentForSSR } from '../index';

const compile =
    (src: string, filename = 'test.js') =>
    () => {
        return compileComponentForSSR(src, filename, {});
    };

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

describe('component compilation errors', () => {
    describe('api decorator', () => {
        test('conflicting api properties with getter/setter', () => {
            expect(
                compile(/* js */ `
                import { api, LightningElement } from "lwc";
                export default class Text extends LightningElement {
                    @api foo = 1;

                    _internal = 1;

                    @api
                    get foo() {
                        return "foo";
                    }
                    set foo(val) {
                        this._internal = val;
                    }
                }
            `)
            ).toThrow(`LWC1096: Duplicate @api property "foo".`);
        });

        test('conflicting api properties with method', () => {
            expect(
                compile(/* js */ `
                import { api, LightningElement } from "lwc";
                    export default class Text extends LightningElement {
                    @api foo = 1;
                    @api foo() {
                        return "foo";
                    }
                }
            `)
            ).toThrow(`LWC1096: Duplicate @api property "foo".`);
        });

        test('detecting @api on both getter and a setter should produce an error', () => {
            expect(
                compile(/* js */ `
                import { api, LightningElement } from "lwc";
                    export default class Test extends LightningElement {
                    @api
                    get something() {
                        return this.s;
                    }
                    @api
                    set something(value) {
                        this.s = value;
                    }
                }
            `)
            ).toThrow(
                `LWC1112: @api get something and @api set something detected in class declaration. Only one of the two needs to be decorated with @api.`
            );
        });

        describe('disallowed props', () => {
            test('class', () => {
                expect(
                    compile(/* js */ `
                    import { LightningElement, api } from 'lwc'

                    export default class extends LightningElement {
                        @api class
                    }
                `)
                ).toThrow(
                    `LWC1110: Invalid property name "class". "class" is a reserved attribute.`
                );
            });

            test('is', () => {
                expect(
                    compile(/* js */ `
                    import { LightningElement, api } from 'lwc'

                    export default class extends LightningElement {
                        @api is
                    }
                `)
                ).toThrow(`LWC1110: Invalid property name "is". "is" is a reserved attribute.`);
            });

            test('slot', () => {
                expect(
                    compile(/* js */ `
                    import { LightningElement, api } from 'lwc'

                    export default class extends LightningElement {
                        @api slot
                    }
                `)
                ).toThrow(`LWC1110: Invalid property name "slot". "slot" is a reserved attribute.`);
            });

            test('style', () => {
                expect(
                    compile(/* js */ `
                    import { LightningElement, api } from 'lwc'

                    export default class extends LightningElement {
                        @api style
                    }
                `)
                ).toThrow(
                    `LWC1110: Invalid property name "style". "style" is a reserved attribute.`
                );
            });
        });
    });
});
