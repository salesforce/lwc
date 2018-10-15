const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('Transform property', () => {
    pluginTest('transforms public props', `
        import { api } from 'lwc';
        export default class Test {
            @api test = 1;
        }
    `, {
        output: {
            code: `export default class Test {
                    constructor() {
                        this.test = 1;
                    }

                    }
                    Test.publicProps = {
                    test: {
                        config: 0
                    }
                };`,
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
            code: `export default class Outer {
                    constructor() {
                        var _class, _temp;

                        this.outer = void 0;
                        this.a = (_temp = _class = class {
                        constructor() {
                            this.innerA = void 0;
                        }

                        }, _class.publicProps = {
                        innerA: {
                            config: 0
                        }
                        }, _temp);
                    }

                    }
                    Outer.publicProps = {
                    outer: {
                        config: 0
                    }
                };`
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
            code: `export default class Test {
                    get publicGetter() {
                        return 1;
                    }

                    }
                    Test.publicProps = {
                    publicGetter: {
                        config: 1
                    }
                };`
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
            code: `export default class Test {
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
                    Test.publicProps = {
                    a: {
                        config: 3
                    },
                    b: {
                        config: 3
                    }
                };`
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
            code: `export default class Text {
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
                    Text.publicProps = {
                    publicProp: {
                        config: 0
                    },
                    aloneGet: {
                        config: 1
                    },
                    myget: {
                        config: 3
                    }
                };
                Text.publicMethods = ["m1"];`
        }
    });

    pluginTest('throws error if default value is true', `
        import { api } from 'lwc';
        export default class Test {
            @api publicProp = true;
        }
    `, {
        error: {
            message: 'test.js: Boolean public property must default to false.',
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
            message: 'test.js: Invalid property name "is". "is" is a reserved attribute.',
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
            message: 'test.js: Invalid property name onChangeHandler. Properties starting with "on" are reserved for event handlers.',
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
            code: `export default class Test {
                    constructor() {
                        this.data = void 0;
                    }

                    }
                    Test.publicProps = {
                    data: {
                        config: 0
                    }
                };`
        }
    });

    pluginTest('throws error if property name prefixed with "data"', `
        import { api } from 'lwc';
        export default class Test {
            @api dataFooBar;
        }
    `, {
        error: {
            message: 'test.js: Invalid property name dataFooBar. Properties starting with "data" are reserved attributes.',
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
            message: 'test.js: Ambiguous attribute name tabindex. tabindex will never be called from template because its corresponding property is camel cased. Consider renaming to "tabIndex".',
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
            message: 'test.js: Ambiguous attribute name maxlength. maxlength will never be called from template because its corresponding property is camel cased. Consider renaming to "maxLength".',
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
            code: `export default class Test {
                    constructor() {
                        this.ariaDescribedBy = void 0;
                    }

                    }
                    Test.publicProps = {
                    ariaDescribedBy: {
                        config: 0
                    }
                };`
        }
    });

    pluginTest('throws error if property name conflicts with disallowed global html attribute name', `
        import { api } from 'lwc';
        export default class Test {
            @api slot;
        }
    `, {
        error: {
            message: 'test.js: Invalid property name "slot". "slot" is a reserved attribute.',
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
            message: 'test.js: Invalid property name part. "part" is a future reserved attribute for web components.',
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
            message: 'test.js: @api method or property cannot be used with @track',
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
            message: 'test.js: Duplicate @api property "foo".',
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
            message: 'test.js: Duplicate @api property "foo".',
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
            message: 'test.js: Duplicate @api property "foo".',
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
            code: `export default class Test {
  foo() {}

}
Test.publicMethods = ["foo"];`
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
            message: 'test.js: @api cannot be applied to a computed property, getter, setter or method.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });
});

describe('Metadata', () => {
    pluginTest(
        'gather metadata',
        `
        import { LightningElement, api } from 'lwc';
        export default class Foo extends LightningElement {
            _privateTodo;

            get todo () {
                return this._privateTodo;
            }
            @api
            set todo (val) {
                return this._privateTodo = val;
            }

            @api
            index;

            @api publicMethod() {}
        }
    `,
        {
            output: {
                metadata: {
                    decorators: [
                        {
                            type: "api",
                            targets: [
                                { name: "todo", type: "property" },
                                { name: "index", type: "property" },
                                { name: "publicMethod", type: "method" }
                            ]
                        }
                    ],
                    classMembers: [
                        {
                            type: "property",
                            name: "todo",
                            loc: {
                                start: { line: 7, column: 0 },
                                end: { line: 10, column: 1 }
                            },
                            decorator: "api"
                        },
                        {
                            type: "property",
                            name: "index",
                            loc: {
                                start: { line: 11, column: 0 },
                                end: { line: 12, column: 6 }
                            },
                            decorator: "api"
                        },
                        {
                            type: "method",
                            name: "publicMethod",
                            loc: {
                                start: { line: 13, column: 0 },
                                end: { line: 13, column: 22 }
                            },
                            decorator: "api"
                        }
                    ],
                    declarationLoc: {
                        start: { column: 0, line: 2 },
                        end: { column: 1, line: 14 }
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
});
