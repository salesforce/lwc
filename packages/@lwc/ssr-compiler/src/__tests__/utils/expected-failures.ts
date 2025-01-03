/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// We should slowly drive down these test failures or at least document where we expect the failures
// TODO [#4815]: enable all SSR v2 tests
export const expectedFailures = new Set([
    'attribute-aria/dynamic/index.js',
    'attribute-class/with-scoped-styles-only-in-child/dynamic/index.js',
    'attribute-class/with-scoped-styles/dynamic/index.js',
    'attribute-global-html/as-component-prop/undeclared/index.js',
    'attribute-global-html/as-component-prop/without-@api/index.js',
    'exports/component-as-default/index.js',
    'known-boolean-attributes/default-def-html-attributes/static-on-component/index.js',
    'render-dynamic-value/index.js',
    'scoped-slots/advanced/index.js',
    'scoped-slots/default-slot/index.js',
    'scoped-slots/mixed-with-light-dom-slots-inside/index.js',
    'scoped-slots/mixed-with-light-dom-slots-outside/index.js',
    'slot-forwarding/slots/mixed/index.js',
    'slot-forwarding/slots/dangling/index.js',
    'slot-not-at-top-level/with-adjacent-text-nodes/lwcIf-as-sibling/light/index.js',
    'slot-not-at-top-level/with-adjacent-text-nodes/lwcIf/light/index.js',
    'slot-not-at-top-level/with-adjacent-text-nodes/if/light/index.js',
    'slot-not-at-top-level/with-adjacent-text-nodes/if-as-sibling/light/index.js',
    'wire/errors/throws-on-computed-key/index.js',
    'wire/errors/throws-when-colliding-prop-then-method/index.js',
]);
