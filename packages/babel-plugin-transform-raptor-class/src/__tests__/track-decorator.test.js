const test = require('./utils/test-transform').test(
    require('../index')
);

describe('Wired field', () => {
    test('transform track decorator field', `
        export default class Test {
            @track record;
        }
    `,`
        export default class Test {}
        Test.track = {
            record: 1
        };
    `);

    test('transform track decorator preserve intial value', `
        export default class Test {
            @track record = {
                value: 'test'
            };
        }
    `,`
        export default class Test {
            constructor() {
                this.record = {
                    value: 'test'
                };
            }

        }
        Test.track = {
            record: 1
        };
    `);


    test('throws if track decorator is applied to a getter', `
        export default class Test {
            @track get record() {
                return 'test';
            }
        }
    `, undefined, {
        message: 'test.js: @track decorator can only be applied to class properties.',
        loc: {
            line: 2,
            column: 11
        }
    });

    test('throws if track decorator is applied to a setter', `
        export default class Test {
            _record;

            @track set record(value) {
                this._record = value;
            }
        }
    `, undefined, {
        message: 'test.js: @track decorator can only be applied to class properties.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a class method', `
        export default class Test {
            _record;

            @track changeRecord(value) {
                this._record = value;
            }
        }
    `, undefined, {
        message: 'test.js: @track decorator can only be applied to class properties.',
        loc: {
            line: 4,
            column: 11
        }
    });
});
