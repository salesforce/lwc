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

    test('throws if track decorator is applied to a global HTML property lang', `
        export default class Test {
            @track tabIndex;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "tabIndex" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property lang', `
        export default class Test {
            @track spellcheck;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "spellcheck" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property lang', `
        export default class Test {
            @track lang;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "lang" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property hidden', `
        export default class Test {
            @track hidden;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "hidden" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property draggable', `
        export default class Test {
            @track draggable;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "draggable" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property dir', `
        export default class Test {
            @track dir;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "dir" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property contextmenu', `
        export default class Test {
            @track contextmenu;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "contextmenu" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property contentEditable', `
        export default class Test {
            @track contentEditable;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "contentEditable" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property accessKey', `
        export default class Test {
            @track accessKey;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "accessKey" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property tabIndex', `
        export default class Test {
            @track tabIndex;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "tabIndex" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if track decorator is applied to a global HTML property title', `
        export default class Test {
            @track title;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "title" instead.',
        loc: {
            line: 4,
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
