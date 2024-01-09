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
        const stylesheet = `
            :host {}
        `;
        const { code } = transformSync(stylesheet, 'foo.css', TRANSFORMATION_OPTIONS);

        expect(code).toMatchInlineSnapshot(`
            "import { hot, swapStyle } from "lwc";
            function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
              var shadowSelector = token ? ("[" + token + "]") : "";
              var hostSelector = token ? ("[" + token + "-host]") : "";
              var suffixToken = token ? ("-" + token) : "";
              return ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "}";
              /*LWC compiler v5.2.2*/
            }
            stylesheet.moduleHash = "b1a904cac7e8191ed9e462bc0adfead2";
            if (hot) {
                hot.register("foo.css", "b1a904cac7e8191ed9e462bc0adfead2");
                hot.accept("foo.css", (mod) => {
                    if(stylesheet.moduleHash != mod.moduleHash) {
                        swapStyle(stylesheet, mod);
                    }
                }
            }
            export default [stylesheet];"
        `);
    });
});
