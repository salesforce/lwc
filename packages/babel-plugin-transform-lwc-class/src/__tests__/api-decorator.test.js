
const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('Transform property', () => {
    pluginTest('transforms public props', `
        import { api } from 'engine';
        export default class Test {
            @api test = 1;
        }
    `, {
        output: {
            code: `
export default class Test {
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
        import { api } from 'engine';
        export default class Outer {
            @api outer;
            a = class {
                @api innerA;
            }
        }
    `, {
        output: {
            code: `
export default class Outer {
  constructor() {
    var _class, _temp;

    this.a = (_temp = _class = class {}, _class.publicProps = {
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
        import { api } from 'engine';
        export default class Test {
            @api get publicGetter() {
                return 1;
            }
        }
    `, {
        output: {
            code: `
export default class Test {
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

    pluginTest('transforms public getter/setter', `
        import { api } from 'engine';
        export default class Test {
            @api get something() {
                return this.s;
            }
            @api set something (value) {
                this.s = value;
            }
        }
    `, {
        output: {
            code: `
export default class Test {
  get something() {
    return this.s;
  }
  set something(value) {
    this.s = value;
  }
}
Test.publicProps = {
  something: {
    config: 3
  }
};`
        }
    });

    pluginTest('throws error if setter is not associated with a getter', `
        import { api } from 'engine';
        export default class Test {
            @api set publicSetter(value) {
                this.thing = value;
            }
        }
    `, {
        error: {
            message: 'test.js: @api set publicSetter setter does not have associated getter.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('transform pairs of setter and getter', `
        import { api } from 'engine';
        export default class Test {
            _a = true;
            _b = false;
            @api get a () { return this._a; }
            @api set a (value) { this._a = value; }
            @api get b () { return this._b; }
            @api set b (value) { this._b = value; }
        }
    `, {
        output: {
            code: `
export default class Test {
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
        import { api } from 'engine';
        export default class Text {
            @api publicProp;
            privateProp;
            @api get aloneGet(){}
            @api get myget(){}
            @api set myget(x){ return 1; }
            @api m1(){}
            m2(){}
            static ctor = "ctor";
            static get ctorGet () { return 1}
        }
    `, {
        output: {
            code: `
export default class Text {
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
        import { api } from 'engine';
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
        import { api } from 'engine';
        export default class Test {
            @api is;
        }
    `, {
        error: {
            message: 'test.js: Invalid property name is. "is" is a reserved attribute.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('throws error if property name prefixed with "on"', `
        import { api } from 'engine';
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
        import { api } from 'engine';
        export default class Test {
            @api data;
        }
    `, {
        output: {
            code: `
export default class Test {}
Test.publicProps = {
  data: {
    config: 0
  }
};`
        }
    });

    pluginTest('throws error if property name prefixed with "data"', `
        import { api } from 'engine';
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

    pluginTest('throws error if property name prefixed with "aria"', `
        import { api } from 'engine';
        export default class Test {
            @api ariaDescribedby;
        }
    `, {
        error: {
            message: 'test.js: Invalid property name ariaDescribedby. Properties starting with "aria" are reserved attributes.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('throws error if property name conflicts with global html attribute name', `
        import { api } from 'engine';
        export default class Test {
            @api slot;
        }
    `, {
        error: {
            message: 'test.js: Invalid property name slot. slot cannot be defined as a public property.',
            loc: {
                line: 2,
                column: 9
            }
        }
    });

    pluginTest('throws error if property name is "part"', `
        import { api } from 'engine';
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
        import { api, track } from 'engine';
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
});

describe('Transform method', () => {
    pluginTest('transforms public methods', `
        import { api } from 'engine';
        export default class Test {
            @api foo() {}
        }
    `, {
        output: {
            code: `
export default class Test {
  foo() {}
}
Test.publicMethods = ['foo'];`
        }
    });

    pluginTest('Does not allow computed api getters and setters', `
        import { api } from 'engine';
        export default class ComputedAPIProp extends Element {
            @api set [x](value) {}
            @api get [x]() {}
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
        import { Element, api } from 'engine';
        export default class Foo extends Element {
            _privateTodo;
            @api get todo () {
                return this._privateTodo;
            }
            @api set todo (val) {
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
                    decorators: [{
                        type: 'api',
                        targets: [
                            { name: 'todo', type: 'property' },
                            { name: 'index', type: 'property' },
                            { name: 'publicMethod', type: 'method' },
                        ],
                    }],
                    declarationLoc: {
                        start: { column: 0, line: 2 },
                        end: { column: 1, line: 13 },
                    },
                    marked: [],
                    modules: {
                        exports: {
                            exported: ['Foo'],
                            specifiers: [{ exported: 'default', kind: 'local', local: 'Foo' }],
                        },
                        imports: [
                            {
                                imported: ['Element', 'api'],
                                source: 'engine',
                                specifiers: [
                                    { imported: 'Element', kind: 'named', local: 'Element' },
                                    { imported: 'api', kind: 'named', local: 'api' },
                                ],
                            },
                        ],
                    },
                    usedHelpers: [],
                },
            },
        },
    );
});
