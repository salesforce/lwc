/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('Element import', () => {
    pluginTest(
        'throws if using default import on lwc',
        `
        import engine from 'lwc';
    `,
        {
            error: {
                message: `Invalid import. "lwc" doesn't have default export.`,
                loc: {
                    line: 1,
                    column: 7,
                },
            },
        }
    );

    pluginTest(
        'throws if using namespace import on lwc',
        `
        import * as engine from 'lwc';
        export default class extends engine.LightningElement {}
    `,
        {
            error: {
                message: `Invalid import. Namespace imports are not allowed on "lwc", instead use named imports "import { LightningElement } from 'lwc'".`,
                loc: {
                    line: 1,
                    column: 7,
                },
            },
        }
    );

    pluginTest(
        'allow to remap the import to LightningElement',
        `
        import { LightningElement as Component } from 'lwc';

        export default class Test extends Component {}
    `,
        {
            output: {
                code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { LightningElement as Component } from "lwc";

                class Test extends Component {}

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'throws non-whitelisted lwc api is imported',
        `
        import { registerTemplate } from "lwc";
        import tmpl from './localTemplate.html';
        registerTemplate(tmpl);
    `,
        {
            error: {
                message: `Invalid import. "registerTemplate" is not part of the lwc api.`,
                loc: {
                    line: 1,
                    column: 7,
                },
            },
        }
    );

    pluginTest(
        'allows importing whitelisted apis from "lwc"',
        `
        import {
            api,
            track,
            wire,
            createElement,
            LightningElement,
            buildCustomElementConstructor,
            getComponentDef,
            getComponentConstructor,
            isComponentConstructor,
            readonly,
            register,
            unwrap,
        } from "lwc";
    `,
        {
            output: {
                code: `import { api, track, wire, createElement, LightningElement, buildCustomElementConstructor, getComponentDef, getComponentConstructor, isComponentConstructor, readonly, register, unwrap } from "lwc";`,
            },
        }
    );
});

describe('render method', () => {
    pluginTest(
        'inject render method',
        `
        import { LightningElement } from "lwc";
        export default class Test extends LightningElement {}
    `,
        {
            output: {
                code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { LightningElement } from "lwc";

                class Test extends LightningElement {}

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'does not insert render method when extending from legacy "engine" Element',
        `
        import { Element } from "engine";
        export default class Test extends Element {}
    `,
        {
            output: {
                code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { Element } from "engine";

                class Test extends Element {}

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        `keep the render method if present`,
        `
        import { LightningElement } from "lwc";
        export default class Test extends LightningElement {
            render() {}
        }
    `,
        {
            output: {
                code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { LightningElement } from "lwc";

                class Test extends LightningElement {
                  render() {}
                }

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );

    pluginTest(
        'only inject render in the exported class',
        `
        import { LightningElement } from 'lwc';

        class Test1 extends LightningElement {}

        export default class Test2 extends LightningElement {}
    `,
        {
            output: {
                code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent } from "lwc";
                import { LightningElement } from "lwc";

                class Test1 extends LightningElement {}

                class Test2 extends LightningElement {}

                export default _registerComponent(Test2, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );
});
