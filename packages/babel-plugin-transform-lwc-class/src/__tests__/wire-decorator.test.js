const pluginTest = require('./utils/test-transform').pluginTest(
    require('../index')
);

describe('Wired field', () => {
    pluginTest('transforms wired field', `
        import { wire } from 'engine';
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            innerRecord;
        }
    `, {
        output: {
            code: `
export default class Test {}
Test.wire = {
  innerRecord: {
    params: { recordId: "recordId" },
    static: { fields: ["Account", 'Rate'] },
    type: "record"
  }
};`
        }
    });

    pluginTest('decorator expects 2 parameters', `
        import { wire } from 'engine';
        export default class Test {
            @wire() innerRecord;
        }
    `, {
        error: {
            message: 'test.js: @wire(<adapterId>, <adapterConfig>) expects 2 parameters.',
            loc: {
                line: 2,
                column: 4,
            },
        }
    });

    pluginTest('decorator expects a function identifier as first parameter', `
        import { wire } from 'engine';
        import { record } from 'data-service';
        export default class Test {
            @wire(record, {}) innerRecord;
        }
    `, {
        output: {
            code: `
import { record } from 'data-service';
export default class Test {}
Test.wire = {
  innerRecord: {
    params: {},
    static: {},
    adapter: record
  }
};`
        }
    });

    pluginTest('decorator expects an imported identifier as first parameter', `
        import { wire } from 'engine';
        const RECORD = "record"
        export default class Test {
            @wire(RECORD, {}) innerRecord;
        }
    `, {
        error: {
            message: 'test.js: @wire expects a function identifier to be imported as first parameter.',
            loc: {
                line: 4,
                column: 6,
            },
        }
    });

    pluginTest('decorator expects an object as second parameter', `
        import { wire } from 'engine';
        export default class Test {
            @wire('record', '$recordId', ['Account', 'Rate']) innerRecord;
        }
    `, {
        error: {
            message: 'test.js: @wire expects a configuration object expression as second parameter.',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('throws when wired property is combined with @api', `
        import { api, wire } from 'engine';
        export default class Test {
            @api
            @wire('record', { recordId: '$recordId', fields: ['Name'] })
            wiredPropWithApi;
        }
    `, {
        error: {
            message: 'test.js: @wire method or property cannot be used with @api',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('throws when wired property is combined with @track', `
        import { track, wire } from 'engine';
        export default class Test {
            @track
            @wire('record', { recordId: '$recordId', fields: ['Name'] })
            wiredWithTrack
        }
    `, {
        error: {
            message: 'test.js: @wire method or property cannot be used with @track',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('throws when using 2 wired decorators', `
        import { wire } from 'engine';
        export default class Test {
            @wire('record', { recordId: '$recordId', fields: ['Address'] })
            @wire('record', { recordId: '$recordId', fields: ['Name'] })
            multipleWire
        }
    `, {
        error: {
            message: 'test.js: Method or property can only have 1 @wire decorator',
            loc: {
                line: 2,
                column: 20,
            },
        }
    });

    pluginTest('should not throw when using 2 separate wired decorators', `
         import { wire } from 'engine';
         export default class Test {
             @wire('record', { recordId: '$recordId', fields: ['Address'] })
             wired1;
             @wire('record', { recordId: '$recordId', fields: ['Name'] })
             wired2;
        }
    `, {
        output: {
            code: `
export default class Test {}
Test.wire = {
  wired1: {
    params: { recordId: 'recordId' },
    static: { fields: ['Address'] },
    type: 'record'
  },
  wired2: {
    params: { recordId: 'recordId' },
    static: { fields: ['Name'] },
    type: 'record'
  }
};`
        }
    });
});

describe('Wired method', () => {
    pluginTest('transforms wired method', `
        import { wire } from 'engine';
        export default class Test {
            @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
            innerRecordMethod() {}
        }
    `, {
        output: {
            code: `
export default class Test {
  innerRecordMethod() {}
}
Test.wire = {
  innerRecordMethod: {
    params: { recordId: "recordId" },
    static: { fields: ["Account", 'Rate'] },
    type: "record",
    method: 1
  }
};`
        }
    });

    pluginTest('throws when wired method is combined with @api', `
        import { api, wire } from 'engine';
        export default class Test {
            @api
            @wire('record', { recordId: '$recordId', fields: ['Name'] })
            wiredWithApi() {}
        }
    `, {
        error: {
            message: 'test.js: @wire method or property cannot be used with @api',
            loc: {
                line: 2,
                column: 20,
            },
        }
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
