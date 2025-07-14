import baseConfig from './base.mjs';
import testPlugin from './plugins/serve-integration.mjs';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: [
        // FIXME: These tests are just symlinks to integration-karma for now so the git diff smaller
        'test/**/*.spec.js',
        '!test/events/focus-event-related-target/index.spec.js',
        '!test/light-dom/host-pseudo/index.spec.js',
        '!test/light-dom/multiple-templates/index.spec.js',
        '!test/light-dom/scoped-slot/if-block/index.spec.js',
        '!test/light-dom/scoped-styles/index.spec.js',
        '!test/light-dom/style-global/index.spec.js',
        '!test/misc/clean-dom/index.spec.js',
        '!test/polyfills/document-body-properties/index.spec.js',
        '!test/polyfills/document-properties/index.spec.js',
        '!test/profiler/mutation-logging/index.spec.js',
        '!test/regression/invalid-key/index.spec.js',
        '!test/rendering/iframe/index.spec.js',
        '!test/rendering/inner-outer-html/index.spec.js',
        '!test/rendering/legacy-stylesheet-api/index.spec.js',
        '!test/rendering/sanitize-stylesheet-token/index.spec.js',
        '!test/rendering/slotting/index.spec.js',
        '!test/rendering/stylesheet-caching/index.spec.js',
        '!test/shadow-dom/ShadowRoot.elementsFromPoint/index.spec.js',
        '!test/signal/protocol/index.spec.js',
        '!test/spread/index.spec.js',
        '!test/swapping/styles/index.spec.js',
        '!test/template/directive-for-each/index.spec.js',

        // Flaky tests that sometimes time out
        '!test/rendering/programmatic-stylesheets/index.spec.js',
        '!test/shadow-dom/multiple-templates/index.spec.js',
        '!test/synthetic-shadow/dom-manual-sharing-nodes/index.spec.js',
        '!test/synthetic-shadow/host-pseudo/index.spec.js',
        '!test/synthetic-shadow/style-svg/index.spec.js',

        // Cannot reassign properties of module
        '!test/api/sanitizeAttribute/index.spec.js',

        // Hacky nonsense highly tailored to Karma
        '!test/custom-elements-registry/index.spec.js',

        // Logging mismatches
        '!test/accessibility/synthetic-cross-root-aria/index.spec.js',
        '!test/api/freezeTemplate/index.spec.js',
        '!test/component/LightningElement.addEventListener/index.spec.js',
    ],
    plugins: [...baseConfig.plugins, testPlugin],
};
