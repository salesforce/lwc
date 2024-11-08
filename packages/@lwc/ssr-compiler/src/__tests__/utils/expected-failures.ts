/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// We should slowly drive down these test failures or at least document where we expect the failures
// TODO [#4815]: enable all SSR v2 tests
export const expectedFailures = new Set([
    'adjacent-text-nodes/empty/index.js',
    'adjacent-text-nodes/nonempty/index.js',
    'adjacent-text-nodes/with-comments/empty1/index.js',
    'adjacent-text-nodes/with-comments/empty2/index.js',
    'adjacent-text-nodes/with-comments/empty3/index.js',
    'adjacent-text-nodes/with-comments/nonempty1/index.js',
    'adjacent-text-nodes/with-comments/nonempty2/index.js',
    'adjacent-text-nodes/with-comments/nonempty3/index.js',
    'adjacent-text-nodes/with-comments/preserve-comments2/index.js',
    'attribute-aria/dynamic/index.js',
    'attribute-class/unstyled/dynamic/index.js',
    'attribute-class/unstyled/static/index.js',
    'attribute-class/with-scoped-styles/dynamic/index.js',
    'attribute-class/with-scoped-styles/static/index.js',
    'attribute-component-global-html/index.js',
    'attribute-global-html/as-component-prop/undeclared/index.js',
    'attribute-global-html/as-component-prop/with-@api/index.js',
    'attribute-global-html/as-component-prop/without-@api/index.js',
    'attribute-namespace/index.js',
    'attribute-style/basic/index.js',
    'attribute-style/dynamic/index.js',
    'comments-text-preserve-off/index.js',
    'context-deep/index.js',
    'context-installation-on-non-element/index.js',
    'context-nested/index.js',
    'context-no-provider/index.js',
    'context-shadowed/index.js',
    'context-simple/index.js',
    'context-slotted/index.js',
    'dynamic-component-no-ctor/index.js',
    'dynamic-components/index.js',
    'empty-text-with-comments-non-static-optimized/index.js',
    'global-html-attributes/index.js',
    // In engine-server we do a no-op, but in ssr-compiler we throw an error. Long-term we probably want an error
    'inner-outer-html/index.js',
    // lwc:dynamic not supported in ssr-compiler since it's deprecated
    'lwc-dynamic/index.js',
    'rehydration/index.js',
    'render-dynamic-value/index.js',
    'scoped-slots/advanced/index.js',
    'scoped-slots/expression/index.js',
    'scoped-slots/for-each/index.js',
    'scoped-slots/mixed-with-light-dom-slots-inside/index.js',
    'scoped-slots/mixed-with-light-dom-slots-outside/index.js',
    'slot-forwarding/scoped-slots/index.js',
    'slot-not-at-top-level/advanced/ifTrue/light/index.js',
    'slot-not-at-top-level/advanced/lwcIf/light/index.js',
    'slot-not-at-top-level/advanced/lwcIf/shadow/index.js',
    'slot-not-at-top-level/ifTrue/light/index.js',
    'slot-not-at-top-level/lwcIf/light/index.js',
    'slot-not-at-top-level/lwcIf/shadow/index.js',
    'svgs/index.js',
    'wire/index.js',
]);
