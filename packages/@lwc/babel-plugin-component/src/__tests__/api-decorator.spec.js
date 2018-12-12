/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('Transform property', () => {
    pluginTest('transforms public props', `
        import { api } from 'lwc';
        export default class Test {
            @api test = 1;
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";

                class Test {
                  constructor() {
                    this.test = 1;
                  }
                }

                _registerDecorators(Test, {
                  publicProps: {
                    test: {
                      config: 0
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
`,
        }
    });

    pluginTest('transform nested classes', `
        import { api } from 'lwc';
        export default class Outer {
            @api outer;
            a = class {
                @api innerA;
            }
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators2 } from "lwc";
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";

                class Outer {
                  constructor() {
                    this.outer = void 0;
                    this.a = _registerDecorators2(
                      class {
                        constructor() {
                          this.innerA = void 0;
                        }
                      },
                      {
                        publicProps: {
                          innerA: {
                            config: 0
                          }
                        }
                      }
                    );
                  }
                }

                _registerDecorators(Outer, {
                  publicProps: {
                    outer: {
                      config: 0
                    }
                  }
                });

                export default _registerComponent(Outer, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('transforms public getters', `
        import { api } from 'lwc';
        export default class Test {
            @api get publicGetter() {
                return 1;
            }
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";

                class Test {
                  get publicGetter() {
                    return 1;
                  }
                }

                _registerDecorators(Test, {
                  publicProps: {
                    publicGetter: {
                      config: 1
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('detecting @api on both getter and a setter should produce an error', `
        import { api } from 'lwc';
        export default class Test {
            @api
            get something() {
                return this.s;
            }
            @api
            set something (value) {
                this.s = value;
            }
        }
    `, {
        error: {
            message: '@api get something and @api set something',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('transform pairs of setter and getter', `
        import { api } from 'lwc';
        export default class Test {
            _a = true;
            _b = false;

            @api get a () { return this._a; }
            set a (value) { this._a = value; }
            @api get b () { return this._b; }
            set b (value) { this._b = value; }
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";

                class Test {
                  constructor() {
                    this._a = true;
                    this._b = false;
                  }

                  get a() {
                    return this._a;
                  }

                  set a(value) {
                    this._a = value;
                  }

                  get b() {
                    return this._b;
                  }

                  set b(value) {
                    this._b = value;
                  }
                }

                _registerDecorators(Test, {
                  publicProps: {
                    a: {
                      config: 3
                    },
                    b: {
                      config: 3
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    })

    pluginTest(`transform complex attributes`, `
        import { api } from 'lwc';
        export default class Text {
            @api publicProp;
            privateProp;

            @api get aloneGet(){}
            @api get myget(){}
            set myget(x){ return 1; }
            @api m1(){}
            m2(){}
            static ctor = "ctor";
            static get ctorGet () { return 1}
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";

                class Text {
                  constructor() {
                    this.publicProp = void 0;
                    this.privateProp = void 0;
                  }

                  get aloneGet() {}

                  get myget() {}

                  set myget(x) {
                    return 1;
                  }

                  m1() {}

                  m2() {}

                  static get ctorGet() {
                    return 1;
                  }
                }

                Text.ctor = "ctor";

                _registerDecorators(Text, {
                  publicProps: {
                    publicProp: {
                      config: 0
                    },
                    aloneGet: {
                      config: 1
                    },
                    myget: {
                      config: 3
                    }
                  },
                  publicMethods: ["m1"]
                });

                export default _registerComponent(Text, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('throws error if default value is true', `
        import { api } from 'lwc';
        export default class Test {
            @api publicProp = true;
        }
    `, {
        error: {
            message: 'Boolean public property must default to false.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('throws error if property name is "is"', `
        import { api } from 'lwc';
        export default class Test {
            @api is;
        }
    `, {
        error: {
            message: 'Invalid property name "is". "is" is a reserved attribute.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('throws error if property name prefixed with "on"', `
        import { api } from 'lwc';
        export default class Test {
            @api onChangeHandler;
        }
    `, {
        error: {
            message: 'Invalid property name onChangeHandler. Properties starting with "on" are reserved for event handlers.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('does not throw error if property name is "data"', `
        import { api } from 'lwc';
        export default class Test {
            @api data;
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";

                class Test {
                  constructor() {
                    this.data = void 0;
                  }
                }

                _registerDecorators(Test, {
                  publicProps: {
                    data: {
                      config: 0
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('throws error if property name prefixed with "data"', `
        import { api } from 'lwc';
        export default class Test {
            @api dataFooBar;
        }
    `, {
        error: {
            message: 'Invalid property name dataFooBar. Properties starting with "data" are reserved attributes.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('throws error if property name is ambiguous', `
        import { api } from 'lwc';
        export default class Test {
            @api tabindex;
        }
    `, {
        error: {
            message: 'Ambiguous attribute name tabindex. tabindex will never be called from template because its corresponding property is camel cased. Consider renaming to "tabIndex".',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('throws correct error if property name is maxlength', `
        import { api } from 'lwc';
        export default class Test {
            @api maxlength;
        }
    `, {
        error: {
            message: 'Ambiguous attribute name maxlength. maxlength will never be called from template because its corresponding property is camel cased. Consider renaming to "maxLength".',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('does not throw if property name prefixed with "aria"', `
        import { api } from 'lwc';
        export default class Test {
            @api ariaDescribedBy;
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";

                class Test {
                  constructor() {
                    this.ariaDescribedBy = void 0;
                  }
                }

                _registerDecorators(Test, {
                  publicProps: {
                    ariaDescribedBy: {
                      config: 0
                    }
                  }
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `
        }
    });

    pluginTest('throws error if property name conflicts with disallowed global html attribute name', `
        import { api } from 'lwc';
        export default class Test {
            @api slot;
        }
    `, {
        error: {
            message: 'Invalid property name "slot". "slot" is a reserved attribute.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('throws error if property name is "part"', `
        import { api } from 'lwc';
        export default class Test {
            @api part;
        }
    `, {
        error: {
            message: 'Invalid property name part. "part" is a future reserved attribute for web components.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('throws when combined with @track', `
        import { api, track } from 'lwc';
        export default class Test {
            @track
            @api
            apiWithTrack = 'foo';
        }
    `, {
        error: {
            message: '@api method or property cannot be used with @track',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('Duplicate api properties', `
        import { api } from 'lwc';
        export default class Text {
            @api foo = 1;
            @api foo = 2;
        }
    `, {
        error: {
            message: 'Duplicate @api property "foo".',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('Conflicting api properties with getter/setter', `
        import { api } from 'lwc';
        export default class Text {
            @api foo = 1;

            _internal = 1;

            @api
            get foo() { return 'foo' };
            set foo(val) { this._internal = val };
        }
    `, {
        error: {
            message: 'Duplicate @api property "foo".',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('Conflicting api properties with method', `
        import { api } from 'lwc';
        export default class Text {
            @api foo = 1;
            @api foo() { return 'foo'; }
        }
    `, {
        error: {
            message: 'Duplicate @api property "foo".',
            loc: {
                line: 2,
                column: 9
            }
        }
    });
});

describe('Transform method', () => {
    pluginTest('transforms public methods', `
        import { api } from 'lwc';
        export default class Test {
            @api foo() {}
        }
    `, {
        output: {
            code: `
                import { registerDecorators as _registerDecorators } from "lwc";
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";

                class Test {
                  foo() {}
                }

                _registerDecorators(Test, {
                  publicMethods: ["foo"]
                });

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
            `
        }
    });

    pluginTest('Does not allow computed api getters and setters', `
        import { LightningElement, api } from 'lwc';
        export default class ComputedAPIProp extends LightningElement {
            @api
            set [x](value) {}
            get [x]() {}
        }
    `, {
        error: {
            message: '@api cannot be applied to a computed property, getter, setter or method.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });
});


function apiValueMetadataTest(testName, apiTestSnippet, expectedClassMemberMetadata) {
    const { name, type, value } = expectedClassMemberMetadata;
    const expectedDecoratorTarget = { name, type, value };

    pluginTest(
        testName,
        `
            import { LightningElement, api } from 'lwc';
            export default class Foo extends LightningElement { ${apiTestSnippet} }
        `,
        {
            output: {
                metadata: {
                    decorators: [{
                        type: "api",
                        targets: [
                            expectedDecoratorTarget,
                        ],
                    }],
                    classMembers: [
                        expectedClassMemberMetadata,
                    ],
                    declarationLoc: {
                        start: { column: 0, line: 2 },
                        end: { column: expect.any(Number), line: expect.any(Number) },
                    },
                    exports: [
                        {
                            type: 'ExportDefaultDeclaration',
                        }
                    ],
                }
            }
        }
    );
}

describe('Metadata', () => {
    apiValueMetadataTest(
        'gather metadata for static "string" property value',
        `@api staticString = "string value";`,
        {
            type: "property",
            name: "staticString",
            loc: {
                end: { line: 2, column: 87 },
                start: { line: 2, column: 52 },
            },
            decorator: "api",
            value: { type: "string", value:"string value" },
        },
    );

    apiValueMetadataTest(
        'gather metadata for static "boolean" property value',
        `@api staticBoolean = false;`,
        {
            type: "property",
            name: "staticBoolean",
            loc: {
                end: { line: 2, column: 79 },
                start: { line: 2, column: 52 },
            },
            decorator: "api",
            value: { type: "boolean", value: false },
        },
    );

    apiValueMetadataTest(
        'gather metadata for static "numeric" property value',
        `@api numeric = 0;`,
        {
            decorator: "api",
            loc: {
                end: { column: 69, line: 2 },
                start: { column: 52, line: 2 },
            },
            name: "numeric",
            type: "property",
            value: { type: "number", value: 0 }
        },
    );

    apiValueMetadataTest(
        'gather metadata for static property without value',
        `@api nodefault`,
        {
            decorator: "api",
            loc: {
                end: { column: 66, line: 2 },
                start: { column: 52, line: 2 },
            },
            name: "nodefault",
            type: "property",
            value: { type: "unresolved", value: undefined }
        },
    );

    apiValueMetadataTest(
        'gather metadata for static property with "undefined" value',
        `@api staticUndefined = undefined;`,
        {
            decorator: "api",
            loc: {
                end: { column: 85, line: 2 },
                start: { column: 52, line: 2 },
            },
            name: "staticUndefined",
            type: "property",
            value: { type: "unresolved", value: undefined }
        },
    );

    apiValueMetadataTest(
        'gather metadata for static property with "null" value',
        `@api staticNull = null;`,
        {
            decorator: "api",
            loc: {
                end: { column: 75, line: 2 },
                start: { column: 52, line: 2 },
            },
            name: "staticNull",
            type: "property",
            value: { type: "null", value: null }
        },
    );

    apiValueMetadataTest(
        'gather metadata for static property with "object" value',
        `@api staticObject = {
            stringProp: "string property",
            numericProp: 0,
            booleanProp: true,
            arrayProp: [],
            objectProp: {},
        };`,
        {
            decorator: "api",
            loc: {
                end: { column: 2, line: 8 },
                start: { column: 52, line: 2 },
            },
            name: "staticObject",
            type: "property",
            value: {
                type: "object",
                value: {
                    stringProp: {
                        type: "string",
                        value: "string property",
                    },
                    numericProp: {
                        type: "number",
                        value: 0,
                    },
                    booleanProp: {
                        type: "boolean",
                        value: true,
                    },
                    arrayProp: {
                        type: "array",
                        value: [],
                    },
                    objectProp: {
                        type: "object",
                        value: {},
                    },
                }
            },
        },
    );

    apiValueMetadataTest(
        'gather metadata for static property with "array" value',
        `@api staticArray = ['stringval', 0, true, null, undefined, {}, []];;`,
        {
            decorator: "api",
            loc: {
                end: { column: 119, line: 2 },
                start: { column: 52, line: 2 },
            },
            name: "staticArray",
            type: "property",
            value: {
                type: "array",
                value: [
                    { type: "string", value: "stringval" },
                    { type: "number", value: 0 },
                    { type: "boolean", value: true },
                    { type: "null", value: null },
                    { type: "unresolved", value: undefined },
                    { type: "object", value: {} },
                    { type: "array", value: [] },
                ]
            }
        },
    );

    pluginTest(
        'does not gather metadata value for public setter and getter methods',
        `
            import { LightningElement, api } from 'lwc';
            export default class Foo extends LightningElement {
                _privateTodo;
                get todo () { return this._privateTodo; }
                @api set todo (val) { return this._privateTodo = val; }
            }
        `,
        {
            output: {
                metadata: {
                    classMembers: [
                        {
                            decorator: "api",
                            loc: {
                                end: { column: 55, line: 5 },
                                start: { column: 0, line: 5 }
                            },
                            name: "todo",
                            type: "property"
                        }
                    ],
                    declarationLoc: {
                        end: { column: 1, line: 6 },
                        start: { column: 0, line: 2 }
                    },
                    decorators: [
                        { targets: [{ name: "todo", type: "property" }], type: "api" }
                    ],
                    exports: [{ type: "ExportDefaultDeclaration" }]
                }
            }
        }
    );
});
