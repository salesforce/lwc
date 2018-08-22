const pluginTest = require('./utils/test-transform').pluginTest(
    [require('../index'), { namespace: 'namespace'}]
);

describe('decorators', () => {
    pluginTest('should replace "c/" references with namespace ', `
        import { LightningElement as Component } from 'lwc';
        import { method } from 'c/utils';
        export default class Test extends Component {}
    `,
    {
        output: {
            code: `
            import _tmpl from \"./test.html\";
            import { LightningElement as Component } from 'lwc';
            import { method } from \"namespace/utils\";
            export default class Test extends Component {
                render() {
                    return _tmpl;
                }

            }
                `
            }
        }
    );

    pluginTest('should not replace "c/" reference if module name is not specified', `
    import { LightningElement as Component } from 'lwc';
    import { method } from 'c/';
    export default class Test extends Component {}
`,
    {
        output: {
            code: `
            import _tmpl from \"./test.html\";
            import { LightningElement as Component } from 'lwc';
            import { method } from 'c/';
            export default class Test extends Component {
                render() {
                    return _tmpl;
                }

            }
                `
            }
        }
    );

    pluginTest('should not replace "c/" past first occurance', `
    import { LightningElement as Component } from 'lwc';
    import { method } from 'c/moduleone/c/property';
    export default class Test extends Component {}
`,
    {
        output: {
            code: `
            import _tmpl from \"./test.html\";
            import { LightningElement as Component } from 'lwc';
            import { method } from \"namespace/moduleone/c/property\";
            export default class Test extends Component {
                render() {
                    return _tmpl;
                }

            }
                `
            }
        }
    );

    pluginTest('should not change import reference if source does not contain "c/"', `
    import { LightningElement as Component } from 'lwc';
    import { method } from './nonamespacehere';
    export default class Test extends Component {}
`,
    {
        output: {
            code: `
            import _tmpl from \"./test.html\";
            import { LightningElement as Component } from 'lwc';
            import { method } from './nonamespacehere';
            export default class Test extends Component {
                render() {
                    return _tmpl;
                }

            }
                `
            }
        }
    );

    pluginTest('should not replace import "c/" if it is not at the beginning of the source', `
    import { LightningElement as Component } from 'lwc';
    import { method } from './module/c/property';
    export default class Test extends Component {}
`,
    {
        output: {
            code: `
            import _tmpl from \"./test.html\";
            import { LightningElement as Component } from 'lwc';
            import { method } from './module/c/property';
            export default class Test extends Component {
                render() {
                    return _tmpl;
                }

            }
                `
            }
        }
    );
});
