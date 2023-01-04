/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const NUM_COMPONENTS = 1000;

// Generates some components with individual CSS for each one.
// We could use @rollup/plugin-virtual for this, but @lwc/rollup-plugin deliberately
// filters virtual modules, so it's simpler to just write to a temp dir.
export function generateStyledComponents() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lwc-'));
    const styledComponents = [];
    const flavors = ['light', 'shadow'];

    // Generate one version for light and another for shadow.
    // We have to do this because light DOM components need modifications both to the
    // template and the component.
    for (const flavor of flavors) {
        const components = Array(NUM_COMPONENTS)
            .fill()
            .map((_, i) =>
                path.join(
                    tmpDir,
                    `src/benchmark/${flavor}/styledComponent${i}/styledComponent${i}.js`
                )
            );

        components.forEach((jsFilename, i) => {
            const cssFilename = jsFilename.replace('.js', '.css');
            const htmlFilename = jsFilename.replace('.js', '.html');

            const js = `
                import { LightningElement } from "lwc";
                export default class extends LightningElement {
                    ${flavor === 'light' ? 'static renderMode = "light";' : ''}
                }`;
            const css = `
                .cmp-${i} {
                  color: #${i.toString(16).padStart(6, '0')};
                }`;
            const html = `
                <template ${flavor === 'light' ? 'lwc:render-mode="light"' : ''}>
                  <div class="cmp-${i}">Hello world</div>
                </template>`;

            fs.mkdirSync(path.dirname(jsFilename), { recursive: true });
            fs.writeFileSync(jsFilename, js, 'utf-8');
            fs.writeFileSync(cssFilename, css, 'utf-8');
            fs.writeFileSync(htmlFilename, html, 'utf-8');
        });

        const oneComponentFilename = path.join(
            tmpDir,
            `src/benchmark/${flavor}/styledComponent.js`
        );
        const oneComponent = `export { default } from ${JSON.stringify(components[0])};`;
        fs.writeFileSync(oneComponentFilename, oneComponent, 'utf-8');

        const allComponentsFilename = path.join(
            tmpDir,
            `src/benchmark/${flavor}/styledComponents.js`
        );
        const allComponents = `
            ${components.map((mod, i) => `import cmp${i} from ${JSON.stringify(mod)}`).join(';')};
            export default [${components.map((_, i) => `cmp${i}`).join(',')}];`;
        fs.writeFileSync(allComponentsFilename, allComponents, 'utf-8');

        styledComponents.push(oneComponentFilename, allComponentsFilename);
    }

    return {
        styledComponents,
        tmpDir,
    };
}
