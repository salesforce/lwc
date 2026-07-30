import { describe, test, expect } from 'vitest';
import { compileComponentForSSR } from '../index';

const compile =
    (src: string, filename = 'test.js') =>
    () => {
        return compileComponentForSSR(src, filename, {});
    };

describe('@api props on in-file base classes (W-23508928)', () => {
    // The fix is a runtime one: every non-exported LightningElement subclass with @api props is
    // given its own __lwcPublicProperties__ via an injected `registerPublicProperties(this, ...)`
    // static block, and the existing runtime prototype-chain union composes them into the
    // exported component. So we assert on the emitted registration calls rather than trying to
    // statically resolve the chain in the compiler.
    function registeredProps(code: string): Array<string[]> {
        // matches `__registerPublicProperties(this, ["a", "b"])`
        const re = /__registerPublicProperties\(\s*this,\s*\[([^\]]*)\]\s*\)/g;
        const out: Array<string[]> = [];
        let m: RegExpExecArray | null;
        while ((m = re.exec(code))) {
            out.push(
                m[1]
                    .split(',')
                    .map((s) => s.trim().replace(/^"|"$/g, ''))
                    .filter(Boolean)
            );
        }
        return out;
    }

    test('registers @api props of a non-exported in-file base class', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            class Base extends LightningElement {
                @api value;
            }
            export default class Cmp extends Base {}
        `;
        const { code } = compileComponentForSSR(src, 'test.js', { name: 'test', namespace: 'x' });
        expect(registeredProps(code)).toContainEqual(['value']);
    });

    test('registers props for every in-file ancestor in a multi-level chain', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            class Base extends LightningElement {
                @api baseProp;
            }
            class Mid extends Base {
                @api midProp;
            }
            export default class Cmp extends Mid {
                @api leafProp;
            }
        `;
        const { code } = compileComponentForSSR(src, 'test.js', { name: 'test', namespace: 'x' });
        const registered = registeredProps(code);
        expect(registered).toContainEqual(['baseProp']);
        expect(registered).toContainEqual(['midProp']);
    });

    test('does not register the exported component (it goes through setStaticInternals)', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            export default class Cmp extends LightningElement {
                @api ownProp;
            }
        `;
        const { code } = compileComponentForSSR(src, 'test.js', { name: 'test', namespace: 'x' });
        // No base class → nothing to register; the exported component is handled elsewhere.
        expect(registeredProps(code)).toEqual([]);
    });

    test('does not register a class that has no @api props', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            class Base extends LightningElement {}
            export default class Cmp extends Base {
                @api leafProp;
            }
        `;
        const { code } = compileComponentForSSR(src, 'test.js', { name: 'test', namespace: 'x' });
        expect(registeredProps(code)).toEqual([]);
    });

    test('registers a base class whose superclass is chosen dynamically (unresolvable statically)', () => {
        // The exported component extends a superclass picked at runtime; the compiler can't know
        // which branch runs, but each candidate base still gets its own registration and the
        // runtime resolves the real prototype.
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            const Options = {
                first: class First extends LightningElement { @api alpha; },
                second: class Second extends LightningElement { @api beta; },
            };
            export default class Cmp extends (globalThis.FLAG ? Options.first : Options.second) {}
        `;
        const { code } = compileComponentForSSR(src, 'test.js', { name: 'test', namespace: 'x' });
        const registered = registeredProps(code);
        expect(registered).toContainEqual(['alpha']);
        expect(registered).toContainEqual(['beta']);
    });
});

describe('thows error', () => {
    test('combined with @track', () => {
        const src = /* js */ `
            import { api, track, LightningElement } from "lwc";
            export default class Test extends LightningElement {
                @track
                @api
                apiWithTrack = "foo";
            }
        `;
        expect(compile(src)).toThrow(`LWC1093: @api method or property cannot be used with @track`);
    });

    describe('conflicting api properties', () => {
        test.for([
            [
                'getter/setter',
                /* js */ `
                @api foo = 1;
                _internal = 1;
                @api
                get foo() {
                    return "foo";
                }
                set foo(val) {
                    this._internal = val;
                }`,
            ],
            [
                'method',
                /* js */ `
                @api foo = 1;
                @api foo() {
                    return "foo";
                }`,
            ],
        ])(`%s`, ([, body]) => {
            const src = /* js */ `
                import { api, LightningElement } from "lwc";
                export default class Test extends LightningElement {
                    ${body}
                }
            `;
            expect(compile(src)).toThrow(`LWC1096: Duplicate @api property "foo".`);
        });
    });

    test('default value is true', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            export default class Test extends LightningElement {
                @api publicProp = true;
            }
        `;
        expect(compile(src)).toThrow(`LWC1099: Boolean public property must default to false.`);
    });

    test('computed api getters and setters', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            export default class Test extends LightningElement {
                @api
                set [x](value) {}
                get [x]() {}
            }
        `;
        expect(compile(src)).toThrow(
            `LWC1106: @api cannot be applied to a computed property, getter, setter or method.`
        );
    });

    test('property name prefixed with data', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            export default class Test extends LightningElement {
                @api dataFooBar;
            }
        `;
        expect(compile(src)).toThrow(
            `LWC1107: Invalid property name "dataFooBar". Properties starting with "data" are reserved attributes.`
        );
    });

    test('property name prefixed with on', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            export default class Test extends LightningElement {
                @api onChangeHandler;
            }
        `;
        expect(compile(src)).toThrow(
            `LWC1108: Invalid property name "onChangeHandler". Properties starting with "on" are reserved for event handlers`
        );
    });

    describe('property name is ambiguous', () => {
        test.for([
            ['bgcolor', 'bgColor'],
            ['accesskey', 'accessKey'],
            ['contenteditable', 'contentEditable'],
            ['tabindex', 'tabIndex'],
            ['maxlength', 'maxLength'],
            ['maxvalue', 'maxValue'],
        ] as [prop: string, suggestion: string][])('%s', ([prop, suggestion]) => {
            const src = /* js */ `
                import { api, LightningElement } from "lwc";
                export default class Test extends LightningElement {
                    @api ${prop};
                }
            `;
            expect(compile(src)).toThrow(
                `LWC1109: Ambiguous attribute name "${prop}". "${prop}" will never be called from template because its corresponding property is camel cased. Consider renaming to "${suggestion}"`
            );
        });
    });

    describe('disallowed props', () => {
        test.for(['class', 'is', 'slot', 'style'])('%s', (prop) => {
            const src = /* js */ `
                import { api, LightningElement } from 'lwc'
                export default class Test extends LightningElement {
                    @api ${prop}
                }
            `;
            expect(compile(src)).toThrow(
                `LWC1110: Invalid property name "${prop}". "${prop}" is a reserved attribute.`
            );
        });
    });

    test('property name is part', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            export default class Test extends LightningElement {
                @api part;
            }
        `;
        expect(compile(src)).toThrow(
            `LWC1111: Invalid property name "part". "part" is a future reserved attribute for web components.`
        );
    });

    test('both getter and a setter', () => {
        const src = /* js */ `
            import { api, LightningElement } from "lwc";
            export default class Test extends LightningElement {
                @api get something() {
                    return this.s;
                }
                @api set something(value) {
                    this.s = value;
                }
            }
        `;
        expect(compile(src)).toThrow(
            `LWC1112: @api get something and @api set something detected in class declaration. Only one of the two needs to be decorated with @api.`
        );
    });
});
