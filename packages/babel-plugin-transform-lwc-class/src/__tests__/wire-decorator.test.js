const test = require('./utils/test-transform').test(
    require('../index')
);

describe('Wired field', () => {
    test('transforms wired field', `
        import { wire } from 'engine';
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
        import { wire } from 'engine';
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
        import { wire } from 'engine';
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
        import { wire } from 'engine';
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
        import { wire } from 'engine';
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
        import { api, wire } from 'engine';
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
        import { api, wire } from 'engine';
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

    test('throws when wired property is combined with @track', `
        import { track, wire } from 'engine';
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
        import { wire } from 'engine';
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
});
