const pluginTest = require('./utils/test-transform').pluginTest([
    require('../index'),
    { namespaceMapping: { a: 'nsA', c: 'nsC' } },
]);

describe('module namespace mapping', () => {
    pluginTest(
        'should handle multiple namespace remapping',
        `import { methodA } from 'a/utils';\n import { methodC } from 'c/utils';`,
        {
            output: {
                code: `import { methodA } from \"nsA/utils\";\n import { methodC } from \"nsC/utils\";`,
            },
        },
    );
});

describe('"@salesforce/label" namespace mapping', () => {
    pluginTest(
        'should replace default namespace on all the import statements',
        `import label1 from '@salesforce/label/c.label1';
         import label2 from '@salesforce/label/c.label2';`,
        {
            output: {
                code: `import label1 from \"@salesforce/label/nsC.label1\";
                       import label2 from \"@salesforce/label/nsC.label2\";`,
            },
        },
    );
});

describe('"@salesforce/componentTagName" namespace mapping', () => {
    pluginTest(
        'should replace default namespace on all the import statements',
        `import tag1 from '@salesforce/componentTagName/c-foo';
         import tag2 from '@salesforce/componentTagName/c-bar';`,
        {
            output: {
                code: `import tag1 from \"@salesforce/componentTagName/nsC-foo\";
                       import tag2 from \"@salesforce/componentTagName/nsC-bar\";`,
            },
        },
    );
});

describe('"@salesforce/resourceUrl" namespace mapping', () => {
    pluginTest(
        'should add namespace if not present on all imports',
        `import r1 from '@salesforce/resourceUrl/resource1';
         import r2 from '@salesforce/resourceUrl/resource2';`,
        {
            output: {
                code: `import r1 from \"@salesforce/resourceUrl/nsC__resource1\";
                             import r2 from \"@salesforce/resourceUrl/nsC__resource2\";`,
            },
        },
    );
});

describe('"@salesforce/apex" namespace mapping', () => {
    pluginTest(
        'should add namespace if not present on all imports',
        `import methodA from '@salesforce/apex/MyClass.methodA';
         import methodB from '@salesforce/apex/MyClass.methodB';`,
        {
            output: {
                code: `import methodA from \"@salesforce/apex/nsC.MyClass.methodA\";
                             import methodB from \"@salesforce/apex/nsC.MyClass.methodB\";`,
            },
        },
    );
});

describe('"@salesforce/schema" namespace mapping', () => {
    pluginTest(
        'should add namespace if not present on all imports',
        `import methodA from '@salesforce/schema/CustomObject__c';
         import methodB from '@salesforce/schema/Account.CustomField__c';
         import methodC from '@salesforce/schema/Account.Relation__r.Name';`,
        {
            output: {
                code: `import methodA from \"@salesforce/schema/nsC__CustomObject__c\";
                            import methodB from \"@salesforce/schema/Account.nsC__CustomField__c\";
                            import methodC from \"@salesforce/schema/Account.nsC__Relation__r.Name\";`,
            },
        },
    );
});
