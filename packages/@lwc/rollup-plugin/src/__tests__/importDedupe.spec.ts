/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { it, expect } from 'vitest';
import { runRollup } from './util';

// This test validates the behavior of rollup because import deduping was handled by
// @lwc/babel-plugin-component prior to v9 and we want to ensure there are no regressions
it('merges duplicate imports', async () => {
    const { code, warnings } = await runRollup('importDedupe/importDedupe.js', {});
    const lwcImport = /import \{ ([^}]+?) \} from 'lwc'/g;
    const imports = Array.from(code.matchAll(lwcImport));
    expect(warnings).toHaveLength(0);
    expect(imports).toHaveLength(1);
    const specifiers = imports[0][1];
    // `specifiers` should include `LightningElement` and `renderer` from basic.js
    // we don't do an exact string match because the compiler adds imports
    expect(specifiers).toContain('renderer');
    expect(specifiers).not.toContain('renderer as');
});
