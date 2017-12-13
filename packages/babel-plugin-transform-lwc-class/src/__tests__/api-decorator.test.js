const test = require('./utils/test-transform').test(
    require('../index')
);

describe('Public Props', () => {
    test('transforms public props', `
        export default class Test {
            @api test = 1;
        }
    `,`
        export default class Test {
            constructor() {
                this.test = 1;
            }

        }
        Test.publicProps = {
            test: {
                config: 0
            }
        };
    `);

    test('transform nested classes', `
        export default class Outer {
            @api outer;

            a = class {
                @api innerA;
            }
        }
    `, `
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
        };
    `);

    test('transforms public getters', `
        export default class Test {
            @api get publicGetter() {
                return 1;
            }
        }
    `, `
        export default class Test {
            get publicGetter() {
                return 1;
            }
        }
        Test.publicProps = {
            publicGetter: {
                config: 1
            }
        };
    `);

    test('transforms public getter/setter', `
        export default class Test {
            @api get something() {
                return this.s;
            }

            @api set something (value) {
                this.s = value;
            }
        }
    `, `
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
        };
    `);

    test('throws error if setter is not associated with a getter', `
        export default class Test {
            @api set publicSetter(value) {
                this.thing = value;
            }
        }
    `, undefined, {
        message: 'test.js: @api set publicSetter setter does not have associated getter.',
        loc: {
            line: 2,
            column: 9
        }
    });

    test('transform pairs of setter and getter', `
        export default class Test {
            _a = true;
            _b = false;

            @api get a () { return this._a; }
            @api set a (value) { this._a = value; }

            @api get b () { return this._b; }
            @api set b (value) { this._b = value; }
        }
    `, `
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
        };
    `)

    test(`transform complex attributes`, `
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
    `, `
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
        Text.publicMethods = ["m1"];
    `);

    test('throws error if default value is true', `
        export default class Test {
            @api publicProp = true;
        }
    `, undefined, {
        message: 'test.js: Boolean public property publicProp must default to false.',
        loc: {
            line: 2,
            column: 9
        }
    });
});

describe('Public Methods', () => {
    test('transforms public methods', `
        export default class Test {
            @api foo() {}
        }
    `, `
        export default class Test {
            foo() {}
        }
        Test.publicMethods = ["foo"];
    `);
});

describe('metadata', () => {
    test('has @api properties', `
        import { Element } from 'engine';
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
        }
    `, undefined, undefined, {
            apiProperties: [{ name: 'todo' }, { name: 'index' }]
    });

    test('no @api properties', `
        import { Element } from 'engine';
        export default class Foo extends Element {
            _privateTodo;
            get todo () {
                return this._privateTodo;
            }
            set todo (val) {
                return this._privateTodo = val;
            }
            index;
        }
    `, undefined, undefined, {
        apiProperties: []
    });
});
