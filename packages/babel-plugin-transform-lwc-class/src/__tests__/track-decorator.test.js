const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('Wired field', () => {
    pluginTest('transform track decorator field', `
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
};`
        }
    });

    pluginTest('transform track decorator preserve intial value', `
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
};`
        }
    });


    pluginTest('throws if track decorator is applied to a getter', `
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

    pluginTest('throws if track decorator is applied to a setter', `
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

    pluginTest('throws if track decorator is applied to a class method', `
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
