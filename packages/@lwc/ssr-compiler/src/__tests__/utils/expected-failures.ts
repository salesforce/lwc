/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// We should slowly drive down these test failures or at least document where we expect the failures
// TODO [#4815]: enable all SSR v2 tests
export const expectedFailures = new Set([
    'attribute-global-html/as-component-prop/undeclared/config.json',
    'attribute-global-html/as-component-prop/without-@api/config.json',
    'known-boolean-attributes/default-def-html-attributes/static-on-component/config.json',
    'wire/errors/throws-when-colliding-prop-then-method/config.json',
    'scope-token/config.json',
    'scope-token-extended/config.json',
]);
