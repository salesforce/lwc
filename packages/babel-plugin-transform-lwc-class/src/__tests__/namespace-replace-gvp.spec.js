const pluginTest = require('./utils/test-transform').pluginTest(
    [require('../index'), { namespaceMapping: { 'c': 'namespace'}}]
);

describe('component namespace replace in GVP resources', () => {
    pluginTest('should replace "c" references in @salesforce/label/import', `
        import { LightningElement as Component } from 'lwc';
        import label from '@salesforce/label/c.label1';
        export default class Test extends Component {}
    `,
    {
        output: {
            code: `
            import _tmpl from \"./test.html\";
            import { LightningElement as Component } from 'lwc';
            import label from \"@salesforce/label/namespace.label1\";
            export default class Test extends Component {
                render() {
                    return _tmpl;
                }

            }
                `
            }
        }
    );

    pluginTest('should replace "c" references in @salesforce/label/import', `
    import { LightningElement as Component } from 'lwc';
    import resource from '@salesforce/resource-url/resource1';
    export default class Test extends Component {}
`,
{
    output: {
        code: `
        import _tmpl from \"./test.html\";
        import { LightningElement as Component } from 'lwc';
        import resource from \"@salesforce/resource-url/namespace__resource1\";
        export default class Test extends Component {
            render() {
                return _tmpl;
            }

        }
            `
        }
    });

    pluginTest('should replace "c" references in @salesforce/label/import', `
    import { LightningElement as Component } from 'lwc';
    import myapex from '@salesforce/apex/MyClass.methodA';
    export default class Test extends Component {}
`,
{
    output: {
        code: `
        import _tmpl from \"./test.html\";
        import { LightningElement as Component } from 'lwc';
        import myapex from \"@salesforce/apex/namespace.MyClass.methodA\";
        export default class Test extends Component {
            render() {
                return _tmpl;
            }

        }
            `
        }
    });

    pluginTest('should replace "c" references in @salesforce/label/import', `
    import { LightningElement as Component } from 'lwc';
    import myschema from '@salesforce/schema/CustomObject1__c';
    export default class Test extends Component {}
`,
{
    output: {
        code: `
        import _tmpl from \"./test.html\";
        import { LightningElement as Component } from 'lwc';
        import myschema from \"@salesforce/schema/namespace__CustomObject1__c\";
        export default class Test extends Component {
            render() {
                return _tmpl;
            }

        }
            `
        }
    });
});
