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

describe('api decorator', () => {
    test('throws when combined with @track', () => {
        expect(
            compile(/* js */ `
                import { api, track, LightningElement } from "lwc";
                export default class Test extends LightningElement {
                    @track
                    @api
                    apiWithTrack = "foo";
                }
            `)
        ).toThrow(`LWC1093: @api method or property cannot be used with @track`);
    });

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
        test.for(['class', 'is', 'slot', 'style'])('%s', (prop) => {
            expect(
                compile(/* js */ `
                    import { LightningElement, api } from 'lwc'

                    export default class extends LightningElement {
                        @api ${prop}
                    }
                `)
            ).toThrow(
                `LWC1110: Invalid property name "${prop}". "${prop}" is a reserved attribute.`
            );
        });
    });

    test('does not allow computed api getters and setters', () => {
        expect(
            compile(/* js */ `
            import { LightningElement, api } from "lwc";
            export default class ComputedAPIProp extends LightningElement {
                @api
                set [x](value) {}
                get [x]() {}
            }
        `)
        ).toThrow(
            `LWC1106: @api cannot be applied to a computed property, getter, setter or method.`
        );
    });

    test('duplicate api properties', () => {
        expect(
            compile(/* js */ `
            import { api, LightningElement } from "lwc";
            export default class Text extends LightningElement {
                @api foo = 1;
                @api foo = 2;
            }
        `)
        ).toThrow(`LWC1096: Duplicate @api property "foo".`);
    });

    describe('throws if property name is ambiguous', () => {
        test.for([
            ['bgcolor', 'bgColor'],
            ['accesskey', 'accessKey'],
            ['contenteditable', 'contentEditable'],
            ['tabindex', 'tabIndex'],
            ['maxlength', 'maxLength'],
            ['maxvalue', 'maxValue'],
        ] as const)('%s', ([prop, suggestion]) => {
            expect(
                compile(/* js */ `
                import { api, LightningElement } from "lwc";
                    export default class Test extends LightningElement {
                    @api ${prop};
                }
            `)
            ).toThrow(
                `LWC1109: Ambiguous attribute name "${prop}". "${prop}" will never be called from template because its corresponding property is camel cased. Consider renaming to "${suggestion}"`
            );
        });
    });

    test('throws error if default value is true', () => {
        expect(
            compile(/* js */ `
            import { api, LightningElement } from "lwc";
                export default class Test extends LightningElement {
                @api publicProp = true;
            }
        `)
        ).toThrow(`LWC1099: Boolean public property must default to false.`);
    });

    test('throws if property name is part', () => {
        expect(
            compile(/* js */ `
            import { api, LightningElement } from "lwc";
                export default class Test extends LightningElement {
                @api part;
            }
        `)
        ).toThrow(
            `LWC1111: Invalid property name "part". "part" is a future reserved attribute for web components.`
        );
    });

    test('throws if property name prefixed with data', () => {
        expect(
            compile(/* js */ `
            import { api, LightningElement } from "lwc";
            export default class Test extends LightningElement {
                @api dataFooBar;
            }
        `)
        ).toThrow(
            `LWC1107: Invalid property name "dataFooBar". Properties starting with "data" are reserved attributes.`
        );
    });

    test('throws if property name prefixed with on', () => {
        expect(
            compile(/* js */ `
            import { api, LightningElement } from "lwc";
            export default class Test extends LightningElement {
                @api onChangeHandler;
            }
        `)
        ).toThrow(
            `LWC1108: Invalid property name "onChangeHandler". Properties starting with "on" are reserved for event handlers`
        );
    });
});
