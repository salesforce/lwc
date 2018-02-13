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

    pluginTest('throws if track decorator is applied to a global HTML property lang', `
        export default class Test {
            @track tabIndex;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "tabIndex" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property lang', `
        export default class Test {
            @track spellcheck;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "spellcheck" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property lang', `
        export default class Test {
            @track lang;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "lang" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property hidden', `
        export default class Test {
            @track hidden;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "hidden" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property draggable', `
        export default class Test {
            @track draggable;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "draggable" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property dir', `
        export default class Test {
            @track dir;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "dir" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property contextmenu', `
        export default class Test {
            @track contextmenu;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "contextmenu" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property contentEditable', `
        export default class Test {
            @track contentEditable;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "contentEditable" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property accessKey', `
        export default class Test {
            @track accessKey;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "accessKey" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property tabIndex', `
        export default class Test {
            @track tabIndex;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "tabIndex" instead.',
            loc: {
                line: 4,
                column: 11
            }
        }
    });

    pluginTest('throws if track decorator is applied to a global HTML property title', `
        export default class Test {
            @track title;
        }
    `, {
        error: {
            message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "title" instead.',
            loc: {
                line: 4,
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
