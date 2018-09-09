const pluginTest = require('./utils/test-transform').pluginTest([
    require('../index'),
    { namespaceMapping: { a: 'nsA', c: 'nsC' } },
]);

describe('module namespace mapping', () => {
    pluginTest(
        'should replace handle single namespace remapping',
        `import { method } from 'c/utils';`,
        {
            output: { code: `import { method } from \"nsC/utils\";` },
        },
    );

    pluginTest(
        'should handle multiple namespace remapping',
        `import { methodA } from 'a/utils';\n import { methodC } from 'c/utils';`,
        {
            output: {
                code: `import { methodA } from \"nsA/utils\";\n import { methodC } from \"nsC/utils\";`,
            },
        },
    );

    pluginTest(
        "should not replace references if it doesn't match fully",
        `import { method } from 'abc-utils';`,
        {
            output: { code: `import { method } from 'abc-utils';` },
        },
    );

    pluginTest(
        'should not change import reference if source does not contain the namespace',
        `import { method } from './nonamespacehere';`,
        {
            output: { code: `import { method } from './nonamespacehere';` },
        },
    );

    pluginTest(
        'should not replace import the namespace if it is not at the beginning of the module name',
        `import { method } from './module/c-inner/property';`,
        {
            output: {
                code: `import { method } from './module/c-inner/property';`,
            },
        },
    );
});

describe('"@salesforce/label" namespace mapping', () => {
    pluginTest(
        'should replace default namespace',
        `import label from '@salesforce/label/c.label';`,
        {
            output: {
                code: `import label from \"@salesforce/label/nsC.label\";`,
            },
        },
    );

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

    pluginTest(
        'should keep original namespace untouched',
        `import label from '@salesforce/label/othernamespace.label';`,
        {
            output: {
                code: `import label from '@salesforce/label/othernamespace.label';`,
            },
        },
    );
});

describe('"@salesforce/componentTagName" namespace mapping', () => {
    pluginTest(
        'should replace default namespace',
        `import tag from '@salesforce/componentTagName/c-foo';`,
        {
            output: {
                code: `import tag from \"@salesforce/componentTagName/nsC-foo\";`,
            },
        },
    );

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

    pluginTest(
        'should keep original namespace untouched',
        `import tag from '@salesforce/componentTagName/othernamespace-foo';`,
        {
            output: {
                code: `import tag from '@salesforce/componentTagName/othernamespace-foo';`,
            },
        },
    );
});

describe('"@salesforce/resource-url" namespace mapping', () => {
    pluginTest(
        'should add namespace if not present',
        `import resource from '@salesforce/resource-url/resource';`,
        {
            output: {
                code: `import resource from \"@salesforce/resource-url/nsC__resource\";`,
            },
        },
    );

    pluginTest(
        'should add namespace if not present on all imports',
        `import r1 from '@salesforce/resource-url/resource1';
         import r2 from '@salesforce/resource-url/resource2';`,
        {
            output: {
                code: `import r1 from \"@salesforce/resource-url/nsC__resource1\";
                             import r2 from \"@salesforce/resource-url/nsC__resource2\";`,
            },
        },
    );

    pluginTest(
        'should ignore import if namespace if already present',
        `import resource from '@salesforce/resource-url/anotherNs__resource';`,
        {
            output: {
                code: `import resource from '@salesforce/resource-url/anotherNs__resource';`,
            },
        },
    );
});

describe('"@salesforce/apex" namespace mapping', () => {
    pluginTest(
        'should add namespace if not present',
        `import method from '@salesforce/apex/MyClass.methodA';`,
        {
            output: {
                code: `import method from \"@salesforce/apex/nsC.MyClass.methodA\";`,
            },
        },
    );

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

    pluginTest(
        'should ignore import if namespace if already present',
        `import method from '@salesforce/apex/anotherNamespace.MyClass.methodA';`,
        {
            output: {
                code: `import method from '@salesforce/apex/anotherNamespace.MyClass.methodA';`,
            },
        },
    );
});

describe('"@salesforce/schema" namespace mapping', () => {
    pluginTest(
        'should add namespace custom object',
        `import method from '@salesforce/schema/CustomObject__c';`,
        {
            output: {
                code: `import method from \"@salesforce/schema/nsC__CustomObject__c\";`,
            },
        },
    );

    pluginTest(
        'should add namespace on custom fields on standard objects',
        `import method from '@salesforce/schema/Account.CustomField__c';`,
        {
            output: {
                code: `import method from \"@salesforce/schema/Account.nsC__CustomField__c\";`,
            },
        },
    );

    pluginTest(
        'should add namespace on custom relationships on standard object',
        `import method from '@salesforce/schema/Account.Relation__r.Name';`,
        {
            output: {
                code: `import method from \"@salesforce/schema/Account.nsC__Relation__r.Name\";`,
            },
        },
    );

    pluginTest(
        'should ignore standard object and relationships',
        `import method from '@salesforce/schema/Contact.Account.Name';`,
        {
            output: {
                code: `import method from '@salesforce/schema/Contact.Account.Name';`,
            },
        },
    );

    pluginTest(
        'should handle mixed standard and custom relationships',
        `import method from '@salesforce/schema/CustomObject__c.parentContact__r.Account.Name';`,
        {
            output: {
                code: `import method from \"@salesforce/schema/nsC__CustomObject__c.nsC__parentContact__r.Account.Name\";`,
            },
        },
    );

    pluginTest(
        'should not add a namespace to a custom object with an existing namespace',
        `import method from '@salesforce/schema/ns__CustomObject__c';`,
        {
            output: {
                code: `import method from '@salesforce/schema/ns__CustomObject__c';`,
            },
        },
    );

    pluginTest(
        'should not add a namespace to a custom field with an existing namespace',
        `import method from '@salesforce/schema/Account.ns__CustomField__c';`,
        {
            output: {
                code: `import method from '@salesforce/schema/Account.ns__CustomField__c';`,
            },
        },
    );

    pluginTest(
        'should not add a namespace to a custom relationship with an existing namespace',
        `import method from '@salesforce/schema/Account.ns__Relation__r.Name';`,
        {
            output: {
                code: `import method from '@salesforce/schema/Account.ns__Relation__r.Name';`,
            },
        },
    );
});
