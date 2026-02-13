/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect } from 'vitest';

import { runRollup } from './util';

describe('integration', () => {
    describe('typescript', () => {
        it(`resolves and transform .ts files`, async () => {
            const { code } = await runRollup('typescript/typescript.ts');
            expect(code).toContain('class TypeScript');
            expect(code).toContain('registerComponent');
        });
    });
});
