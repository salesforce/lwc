/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// We should slowly drive down these test failures or at least document where we expect the failures
// TODO [#4815]: enable all SSR v2 tests
export const expectedFailures = {
    'adjacent-text-nodes/empty/index.js': ['expected.html'],
    'adjacent-text-nodes/with-comments/empty1/index.js': ['expected.html'],
    'adjacent-text-nodes/with-comments/empty2/index.js': ['expected.html'],
    'adjacent-text-nodes/with-comments/empty3/index.js': ['expected.html'],
    'adjacent-text-nodes/with-comments/nonempty1/index.js': ['expected.html'],
    'adjacent-text-nodes/with-comments/nonempty2/index.js': ['expected.html'],
    'adjacent-text-nodes/with-comments/nonempty3/index.js': ['expected.html'],
    'adjacent-text-nodes/with-comments/preserve-comments2/index.js': ['expected.html'],
    'attribute-aria/dynamic/index.js': ['expected.html'],
    'attribute-class/unstyled/dynamic/index.js': ['expected.html'],
    'attribute-class/with-scoped-styles-only-in-child/dynamic/index.js': ['expected.html'],
    'attribute-class/with-scoped-styles-only-in-parent/dynamic/index.js': ['expected.html'],
    'attribute-class/with-scoped-styles/dynamic/index.js': ['expected.html'],
    'attribute-component-global-html/index.js': ['expected.html'],
    'attribute-global-html/as-component-prop/undeclared/index.js': ['expected.html'],
    'attribute-global-html/as-component-prop/without-@api/index.js': ['expected.html'],
    'attribute-namespace/index.js': ['expected.html'],
    'attribute-style/basic/index.js': ['expected.html'],
    'attribute-style/dynamic/index.js': ['expected.html'],
    'comments-text-preserve-off/index.js': ['expected.html'],
    'dynamic-slots/index.js': ['expected.html'],
    'empty-text-with-comments-non-static-optimized/index.js': ['expected.html'],
    'if-conditional-slot-content/index.js': ['expected.html'],
    'rehydration/index.js': ['expected.html'],
    'render-dynamic-value/index.js': ['expected.html'],
    'scoped-slots/advanced/index.js': ['expected.html'],
    'scoped-slots/expression/index.js': ['expected.html', 'error.txt'],
    'scoped-slots/for-each/index.js': ['expected.html', 'error.txt'],
    'scoped-slots/mixed-with-light-dom-slots-inside/index.js': ['expected.html', 'error.txt'],
    'scoped-slots/mixed-with-light-dom-slots-outside/index.js': ['expected.html'],
    'slot-forwarding/scoped-slots/index.js': ['expected.html'],
    'slot-not-at-top-level/advanced/ifTrue/light/index.js': ['expected.html'],
    'slot-not-at-top-level/advanced/ifTrue/shadow/index.js': ['expected.html'],
    'slot-not-at-top-level/advanced/lwcIf/light/index.js': ['expected.html'],
    'slot-not-at-top-level/advanced/lwcIf/shadow/index.js': ['expected.html'],
    'slot-not-at-top-level/ifTrue/light/index.js': ['expected.html'],
    'slot-not-at-top-level/ifTrue/shadow/index.js': ['expected.html'],
    'slot-not-at-top-level/lwcIf/light/index.js': ['expected.html'],
    'slot-not-at-top-level/lwcIf/shadow/index.js': ['expected.html'],
    'superclass/mixin/index.js': ['expected.html', 'error.txt'],
    'superclass/override/index.js': ['expected.html'],
    'svgs/index.js': ['expected.html'],
    'inner-outer-html/index.js': {
        'expected.html': 'expected-ssr.html',
        'error.txt': 'error-ssr.txt',
    },
    'lwc-dynamic/index.js': {
        'expected.html': 'expected-ssr.html',
        'error.txt': 'error-ssr.txt',
    },
};
