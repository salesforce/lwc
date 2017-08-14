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
        Test.observedAttributes = ["record-id"];
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

    test('merge wired field with observedAttributes', `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", "Rate"]})
            innerRecord;

            static observedAttributes = ["foo"];
        }
    `, `
        export default class Test {}
        Test.observedAttributes = ["foo", "record-id"];
        Test.wire = {
            innerRecord: {
                type: "record",
                params: { recordId: "recordId" },
                static: { fields: ["Account", "Rate"] }
            }
        };
        Test.originalObservedAttributes = ["foo"];
    `);
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
        Test.observedAttributes = ["record-id"];
    `);

    test(`merge wired field with observedAttributes`, `
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", "Rate"]})
            innerRecordMethod() {}
            static observedAttributes = ["foo"];
        }
    `, `
        export default class Test {
            innerRecordMethod() {}
        }
        Test.observedAttributes = ["foo", "record-id"];
        Test.wire = {
            innerRecordMethod: {
                type: "record",
                params: { recordId: "recordId" },
                static: { fields: ["Account", "Rate"] },
                method: 1
            }
        };
        Test.originalObservedAttributes = ["foo"];
    `)
});
