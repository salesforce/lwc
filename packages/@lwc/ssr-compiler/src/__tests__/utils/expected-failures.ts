/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// We should slowly drive down these test failures or at least document where we expect the failures
// TODO [#4815]: enable all SSR v2 tests
const workMap: Record<`W-${number}` | `TO BE FILED:${string}`, `${string}/index.js`[]> = {
    'W-16871512': [
        // self closing tags
        'svgs/index.js',
        // self-closing tag missing
        'attribute-namespace/index.js',
    ],
    'W-17150207': [
        // bookends and missing content
        'scoped-slots/advanced/index.js',
        // throws error
        'scoped-slots/expression/index.js',
        // throws error
        'scoped-slots/mixed-with-light-dom-slots-inside/index.js',
        // renders content, but it shouldn't
        'scoped-slots/mixed-with-light-dom-slots-outside/index.js',
    ],
    'W-17150130': [
        // bonus bookends
        'slot-not-at-top-level/advanced/lwcIf/light/index.js',
        // bonus bookends
        'slot-not-at-top-level/advanced/lwcIf/shadow/index.js',
        // bonus bookends
        'slot-not-at-top-level/lwcIf/light/index.js',
        // bonus bookends
        'slot-not-at-top-level/lwcIf/shadow/index.js',
    ],
    'W-17017336': [
        // bonus bookends
        'slot-forwarding/scoped-slots/index.js',
        // missing slot attr, bonus bookends
        'slot-forwarding/slots/mixed/index.js',
        // missing slot attr, bonus bookends
        'slot-forwarding/slots/dangling/index.js',
        // bonus bookends
        'slot-forwarding/slots/light/index.js',
    ],
    'TO BE FILED: align error messages': [
        // divergent error
        'wire/errors/throws-on-computed-key/index.js',
        // divergent error
        'wire/errors/throws-when-colliding-prop-then-method/index.js',
        // divergent error
        'wire/errors/throws-when-computed-prop-is-expression/index.js',
        // divergent error
        'wire/errors/throws-when-computed-prop-is-let-variable/index.js',
        // divergent error
        'wire/errors/throws-when-computed-prop-is-regexp-literal/index.js',
        // divergent error
        'wire/errors/throws-when-computed-prop-is-template-literal/index.js',
        // divergent error
        'wire/errors/throws-when-using-2-wired-decorators/index.js',
    ],
    'TO BE FILED: add validation': [
        // renders but shouldn't
        'wire/errors/throws-when-wired-method-is-combined-with-@api/index.js',
        // renders but shouldn't
        'wire/errors/throws-when-wired-property-is-combined-with-@api/index.js',
        // renders but shouldn't
        'wire/errors/throws-when-wired-property-is-combined-with-@track/index.js',
    ],
    'TO BE FILED: fix superclass rendering': [
        // missing content
        'superclass/render-in-superclass/no-template-in-subclass/index.js',
        // incorrect content
        'superclass/render-in-superclass/unused-default-in-subclass/index.js',
        // missing content
        'superclass/render-in-superclass/unused-default-in-superclass/index.js',
    ],
    'TO BE FILED: ARIA': [
        // aria attributes not rendered
        'attribute-aria/dynamic/index.js',
    ],
    'TO BE FILED: global attributes': [
        // some props not rendered
        'attribute-component-global-html/index.js',
        // incorrect values rendered
        'attribute-global-html/as-component-prop/undeclared/index.js',
        // incorrect draggable rendered
        'known-boolean-attributes/default-def-html-attributes/static-on-component/index.js',
    ],
    'TO BE FILED: style': [
        // incorrect style rendered
        'attribute-style/basic/index.js',
        // incorrect style rendered
        'attribute-style/dynamic/index.js',
    ],
    'TO BE FILED: scope token': [
        // scope token not rendered
        'attribute-class/with-scoped-styles-only-in-child/dynamic/index.js',
        // scope token not rendered
        'attribute-class/with-scoped-styles/dynamic/index.js',
    ],
    'TO BE FILED: unique issues': [
        // aria attributes not rendered
        'attribute-global-html/as-component-prop/without-@api/index.js',
        // test fixture formatting needs fixed?
        'render-dynamic-value/index.js',
        // throws error
        'exports/component-as-default/index.js',
    ],
};

export const expectedFailures = new Set(Object.values(workMap).flat());
