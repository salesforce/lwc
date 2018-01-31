const transformTest = require('./utils/test-transform').transformTest(
    require('../index')
);

describe('Wired field', () => {
    transformTest('transform track decorator field', `
        import { track } from 'engine';
        export default class Test {
            @track record;
        }
    `, {
        output: {
            code: `
                export default class Test {}
                Test.track = {
                    record: 1
                };
            `
        }
    });

    transformTest('transform track decorator preserve intial value', `
        import { track } from 'engine';
        export default class Test {
            @track record = {
                value: 'test'
            };
        }
    `, {
        output: {
            code: `
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
            `
        }
    });


    transformTest('throws if track decorator is applied to a getter', `
        import { track } from 'engine';
        export default class Test {
            @track get record() {
                return 'test';
            }
        }
    `, {
        error: {
            message: 'test.js: @track decorator can only be applied to class properties.',
            loc: {
                line: 2,
                column: 11
            }
        }
    });

    transformTest('throws if track decorator is applied to a setter', `
        import { track } from 'engine';
        export default class Test {
            _record;

            @track set record(value) {
                this._record = value;
            }
        }
    `, {
        error: {
            message: 'test.js: @track decorator can only be applied to class properties.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    transformTest('throws if track decorator is applied to a class method', `
        import { track } from 'engine';
        export default class Test {
            _record;

            @track changeRecord(value) {
                this._record = value;
            }
        }
    `, {
        error: {
            message: 'test.js: @track decorator can only be applied to class properties.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });
});
