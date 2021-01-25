/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'), {
    forceNativeShadow: true,
});

describe('forceNativeShadow flag', () => {
    pluginTest(
        'adds static field if flag is set',
        `
        import { LightningElement } from 'lwc';
        export default class Test extends LightningElement {}
    `,
        {
            output: {
                code: `
                import _tmpl from "./test.html";
                import { registerComponent as _registerComponent, LightningElement } from "lwc";

                class Test extends LightningElement {
                    static forcedNativeShadow = true;
                }

                export default _registerComponent(Test, {
                  tmpl: _tmpl
                });
                `,
            },
        }
    );
});
