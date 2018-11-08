const pluginTestFactory = require('./utils/test-transform').pluginTest;
const pluginTestImplicit = pluginTestFactory(require('../index'), { isExplicitImport: false });

describe('Transform property', () => {
});

describe('Implicit mode', () => {
    pluginTestImplicit('fails with manually imported html', `
        import { LightningElement } from 'lwc';
        import foo from './bar.html';
        export default class Test extends LightningElement { x = foo }
    `, {
        error: {
            message: 'Invalid html import'
        }
    });

    pluginTestImplicit('registerComponent in implicit mode', `
        import { LightningElement } from 'lwc';
        export default class Test extends LightningElement {
        }
    `, {
        output: {
            code: `import _tmpl from \"./test.html\";
            import { registerComponent as _registerComponent } from "lwc";
            import { LightningElement } from 'lwc';
            export default _registerComponent(class Test extends LightningElement {}, {
            tmpl: _tmpl
            });`
        }
    });

    pluginTestImplicit('noop - implicit export function', `
        export default function x() {}
    `, {
        output: {
            code: `export default function x() {}`
        }
    });

    pluginTestImplicit('noop - implicit export const', `
        export default {
            foo: 1
        }
    `, {
        output: {
            code: `export default {
                foo: 1
            };`
        }
    });

    pluginTestImplicit('registerComponent and wire registerDecorator', `
        import { LightningElement, wire } from 'lwc';
        import { getRecord } from 'recordDataService';

        export default class Test extends LightningElement {
            @wire(getRecord, { id: 1 })
            recordData;
        }
    `, {
        output: {
            code: `
            import { registerDecorators as _registerDecorators } from \"lwc\";
            import _tmpl from \"./test.html\";
            import { registerComponent as _registerComponent } from \"lwc\";
            import { LightningElement } from 'lwc';
            import { getRecord } from 'recordDataService';
            export default _registerComponent(_registerDecorators(class Test extends LightningElement {
            recordData;
            }, {
            wire: {
            recordData: {
            adapter: getRecord,
            params: {},
            static: {
            id: 1
            }
            }
            }
            }), {
            tmpl: _tmpl
            });`
        }
    });

    pluginTestImplicit('registerComponent and api registerDecorator', `
        import { LightningElement, api } from 'lwc';
        export default class Test extends LightningElement {
            @api foo;
        }
    `, {
        output: {
            code: `import { registerDecorators as _registerDecorators } from \"lwc\";
            import _tmpl from \"./test.html\";
            import { registerComponent as _registerComponent } from \"lwc\";
            import { LightningElement } from 'lwc';
            export default _registerComponent(_registerDecorators(class Test extends LightningElement {
            foo;
            }, {
            publicProps: {
            foo: {
            config: 0
            }
            }
            }), {
            tmpl: _tmpl
            });`
        }
    });

});
