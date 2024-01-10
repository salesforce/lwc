/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { transformSync } from '../transformer';
import type { TransformOptions } from '../../options';

const TRANSFORMATION_OPTIONS: TransformOptions = {
    namespace: 'x',
    name: 'foo',
    enableHmr: true,
};

describe('transformSync', () => {
    it('should throw when processing an invalid HTML file', () => {
        const template = `
            <template>
                <div>Hello</div>
            </template>
        `;
        const { code } = transformSync(template, 'foo.html', TRANSFORMATION_OPTIONS);

        expect(code).toMatchInlineSnapshot(`
            "import { freezeTemplate } from "lwc";

            import { hot, swapTemplate } from "lwc";

            import _implicitStylesheets from "./foo.css";

            import _implicitScopedStylesheets from "./foo.scoped.css?scoped=true";

            import {parseFragment, registerTemplate} from "lwc";
            const $fragment1 = parseFragment\`<div\${3}>Hello</div>\`;
            function tmpl($api, $cmp, $slotset, $ctx) {
              const {st: api_static_fragment} = $api;
              return [api_static_fragment($fragment1(), 1)];
              /*LWC compiler v5.2.2*/
            }
            export default registerTemplate(tmpl);
            tmpl.stylesheets = [];


            if (_implicitStylesheets) {
              tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
            }
            if (_implicitScopedStylesheets) {
              tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
            }
            tmpl.stylesheetToken = "lwc-1hl7358i549";
            tmpl.legacyStylesheetToken = "x-foo_foo";
            freezeTemplate(tmpl);

            tmpl.moduleHash = "ad4a71f9e9ea2ed264ba2ee32654c3f1";
            if (hot) {
                hot.register("foo.html", "ad4a71f9e9ea2ed264ba2ee32654c3f1");
                hot.accept("foo.html", (mod) => {
                    if(tmpl.moduleHash != mod.moduleHash) {
                        swapTemplate(tmpl, mod);
                    }
                });
            }
            "
        `);
    });
});
