const test = require('./utils/test-transform').test(
    require('../index')
);

describe('Wired field', () => {
    test('transforms wired field', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            innerRecord;
        }
    `,`
        export default class Test {}
        Test.wire = {
            innerRecord: {
                type: "record",
                params: { recordId: "recordId" },
                static: { fields: ["Account", 'Rate'] }
            }
        };
    `);

    test('decorator expects 2 parameters', `
        export default class Test {
            @wire() innerRecord;
        }
    `, undefined, {
        message: 'test.js: @wire(<adapterId>, <adapterConfig>) expects 2 parameters.',
        loc: {
            line: 2,
            column: 4,
        },
    });

    test('decorator expects a string as first parameter', `
        const RECORD = "record"
        export default class Test {
            @wire(RECORD, {}) innerRecord;
        }
    `, undefined, {
        message: 'test.js: @wire expects a string as first parameter.',
        loc: {
            line: 3,
            column: 10,
        },
    });

    test('decorator expects an oject as second parameter', `
        export default class Test {
            @wire('record', '$recordId', ['Account', 'Rate']) innerRecord;
        }
    `, undefined, {
        message: 'test.js: @wire expects a configuration object expression as second parameter.',
        loc: {
            line: 2,
            column: 20,
        },
    });
});

describe('Wired method', () => {
    test('transforms wired method', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            innerRecordMethod() {}
        }
    `, `
        export default class Test {
            innerRecordMethod() {}
        }
        Test.wire = {
            innerRecordMethod: {
                type: "record",
                params: { recordId: "recordId" },
                static: { fields: ["Account", 'Rate'] },
                method: 1
            }
        };
    `);

    test('throws when wired method is combined with @api', `
        export default class Test {
            @api
            @wire('record', { recordId: '$recordId', fields: ['Name'] })
            wiredWithApi() {}
        }
    `, undefined, {
        message: 'test.js: @wire method or property cannot be used with @api',
        loc: {
            line: 2,
            column: 20,
        },
    });

    test('throws when wired property is combined with @api', `
        export default class Test {
            @api
            @wire('record', { recordId: '$recordId', fields: ['Name'] })
            wiredPropWithApi;
        }
    `, undefined, {
        message: 'test.js: @wire method or property cannot be used with @api',
        loc: {
            line: 2,
            column: 20,
        },
    });

    test('throws when wired method is combined with @track', `
        export default class Test {
            @track
            @wire('record', { recordId: '$recordId', fields: ['Name'] })
            wiredWithTrack() {}
        }
    `, undefined, {
        message: 'test.js: @wire method or property cannot be used with @track',
        loc: {
            line: 2,
            column: 20,
        },
    });

    test('throws when wired property is combined with @track', `
        export default class Test {
            @track
            @wire('record', { recordId: '$recordId', fields: ['Name'] })
            wiredWithTrack
        }
    `, undefined, {
        message: 'test.js: @wire method or property cannot be used with @track',
        loc: {
            line: 2,
            column: 20,
        },
    });

    test('throws when using 2 wired decorators', `
        export default class Test {
            @wire('record', { recordId: '$recordId', fields: ['Address'] })
            @wire('record', { recordId: '$recordId', fields: ['Name'] })
            wiredWithTrack
        }
    `, undefined, {
        message: 'test.js: Method or property can only have 1 @wire decorator',
        loc: {
            line: 2,
            column: 20,
        },
    });

    //
    test('throws if wire decorator is applied to a global HTML property tabIndex', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            tabIndex;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "tabIndex" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property spellcheck', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            spellcheck;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "spellcheck" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property lang', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            lang;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "lang" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property hidden', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            hidden;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "hidden" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property draggable', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            draggable;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "draggable" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property dir', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            dir;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "dir" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property contextmenu', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            contextmenu;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "contextmenu" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property contentEditable', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            contentEditable;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "contentEditable" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property accessKey', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            accessKey;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "accessKey" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property tabIndex', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            tabIndex;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "tabIndex" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });

    test('throws if wire decorator is applied to a global HTML property title', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            title;
        }
    `, undefined, {
        message: 'test.js: Only @api decorator can be applied to HTML properties. Use @api "title" instead.',
        loc: {
            line: 4,
            column: 11
        }
    });
});
