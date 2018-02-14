const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('Transform property', () => {
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

describe('Metadata', () => {
    pluginTest('transform track decorator field', `
        import { Element, track } from 'engine';
        export default class Test extends Element {
            @track state;
        }
    `, {
        output: {
            metadata: {
                decorators: [
                    {
                        type: 'track',
                        targets: [
                            { "name": "state", "type": "property" }
                        ]
                    }
                ],
                declarationLoc: {
                    end: { column: 1, line: 12 },
                    start: { column: 0, line: 2 }
                },
                marked: [],
                modules: {
                    exports: { exported: ['Test'], specifiers: [{ exported: "default", kind: "local", local: "Test" }] },
                    imports: [{
                        imported: ['Element', 'track'],
                        source: 'engine', specifiers: [
                            { imported: 'Element', kind: 'named', local: 'Element' },
                            { imported: 'track', kind: 'named', local: 'track' },
                        ]
                    }]
                },
                usedHelpers: []
            }
        }
    });
});
