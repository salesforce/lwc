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
    'attribute-component-global-html/index.js',
    'attribute-global-html/as-component-prop/undeclared/index.js',
    'attribute-global-html/as-component-prop/without-@api/index.js',
    'attribute-namespace/index.js',
    'attribute-style/basic/index.js',
    'attribute-style/dynamic/index.js',
    'context-slotted/index.js',
    'exports/component-as-default/index.js',
    'known-boolean-attributes/default-def-html-attributes/static-on-component/index.js',
    'render-dynamic-value/index.js',
    'scoped-slots/advanced/index.js',
    'scoped-slots/expression/index.js',
    'scoped-slots/mixed-with-light-dom-slots-inside/index.js',
    'scoped-slots/mixed-with-light-dom-slots-outside/index.js',
    'slot-forwarding/scoped-slots/index.js',
    'slot-forwarding/slots/mixed/index.js',
    'slot-forwarding/slots/dangling/index.js',
    'slot-forwarding/slots/light/index.js',
    'slot-not-at-top-level/advanced/lwcIf/light/index.js',
    'slot-not-at-top-level/advanced/lwcIf/shadow/index.js',
    'slot-not-at-top-level/lwcIf/light/index.js',
    'slot-not-at-top-level/lwcIf/shadow/index.js',
    'superclass/render-in-superclass/no-template-in-subclass/index.js',
    'superclass/render-in-superclass/unused-default-in-subclass/index.js',
    'superclass/render-in-superclass/unused-default-in-superclass/index.js',
    'svgs/index.js',
    'wire/errors/throws-on-computed-key/index.js',
    'wire/errors/throws-when-colliding-prop-then-method/index.js',
    'wire/errors/throws-when-computed-prop-is-expression/index.js',
    'wire/errors/throws-when-computed-prop-is-let-variable/index.js',
    'wire/errors/throws-when-computed-prop-is-regexp-literal/index.js',
    'wire/errors/throws-when-computed-prop-is-template-literal/index.js',
    'wire/errors/throws-when-using-2-wired-decorators/index.js',
    'wire/errors/throws-when-wired-method-is-combined-with-@api/index.js',
    'wire/errors/throws-when-wired-property-is-combined-with-@api/index.js',
    'wire/errors/throws-when-wired-property-is-combined-with-@track/index.js',
]);
