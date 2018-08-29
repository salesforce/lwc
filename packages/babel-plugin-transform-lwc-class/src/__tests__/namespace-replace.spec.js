const pluginTest = require('./utils/test-transform').pluginTest(
    [require('../index'), { namespaceMapping: { 'c': 'namespace'}}]
);

describe('component namespace', () => {
    pluginTest('should replace "c-" references with namespace ', `
        import { LightningElement as Component } from 'lwc';
        import { method } from 'c-utils';
        export default class Test extends Component {}
    `,
    {
        output: {
            code: `
            import _tmpl from \"./test.html\";
            import { LightningElement as Component } from 'lwc';
            import { method } from \"namespace-utils\";
            export default class Test extends Component {
                render() {
                    return _tmpl;
                }

            }
                `
            }
        }
    );

    pluginTest('should not replace "c-" references if it has leading characters ', `
    import { LightningElement as Component } from 'lwc';
    import { method } from 'abc-utils';
    export default class Test extends Component {}
    `,
    {
        output: {
            code: `
            import _tmpl from \"./test.html\";
            import { LightningElement as Component } from 'lwc';
            import { method } from 'abc-utils';
            export default class Test extends Component {
                render() {
                    return _tmpl;
                }

            }
                `
            }
        }
    );

    pluginTest('should not change import reference if source does not contain "c-"', `
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

    pluginTest('should not replace import "c-" if it is not at the beginning of the source', `
    import { LightningElement as Component } from 'lwc';
    import { method } from './module/c-inner/property';
    export default class Test extends Component {}
`,
    {
        output: {
            code: `
            import _tmpl from \"./test.html\";
            import { LightningElement as Component } from 'lwc';
            import { method } from './module/c-inner/property';
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
