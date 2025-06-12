import { HIGHEST_API_VERSION, LWC_VERSION } from '@lwc/shared';
import customRollup from './helpers/lwc.mjs';

const pluck = (obj, keys) => Object.fromEntries(keys.map((k) => [k, Boolean(obj[k])]));

const env = {
    ...pluck(process.env, [
        'DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE',
        'DISABLE_STATIC_CONTENT_OPTIMIZATION',
        'DISABLE_SYNTHETIC',
        'ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL',
        'ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION',
        'ENGINE_SERVER',
        'FORCE_NATIVE_SHADOW_MODE_FOR_TEST',
    ]),
    API_VERSION: Number(process.env.API_VERSION) || HIGHEST_API_VERSION,
    LWC_VERSION,
    NATIVE_SHADOW: Boolean(
        process.env.DISABLE_SYNTHETIC || process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST
    ),
    NODE_ENV: process.env.NODE_ENV_FOR_TEST || 'development',
};

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    files: [
        'test/**/*.spec.js',
        // Failing Karma tests that need to be migrated to WTR
        '!test/custom-elements-registry/index.spec.js',
        '!test/spread/index.spec.js',
        '!test/static-content/index.spec.js',
        '!test/wire/reactive-params.spec.js',
        '!test/accessibility/synthetic-cross-root-aria/index.spec.js',
        '!test/api/CustomElementConstructor-getter/index.spec.js',
        '!test/api/isNodeFromTemplate/index.spec.js',
        '!test/api/readonly/index.spec.js',
        '!test/api/registerTemplate/index.spec.js',
        '!test/api/sanitizeAttribute/index.spec.js',
        '!test/api/sanitizeHtmlContent/index.spec.js',
        '!test/component/LightningElement/index.spec.js',
        '!test/component/LightningElement.addEventListener/index.spec.js',
        '!test/component/LightningElement.errorCallback/index.spec.js',
        '!test/component/LightningElement.render/index.spec.js',
        '!test/component/lifecycle-callbacks/index.spec.js',
        '!test/component/native-vs-synthetic-lifecycle/index.spec.js',
        '!test/events/focus-event-related-target/index.spec.js',
        '!test/integrations/locker/index.spec.js',
        '!test/light-dom/ids/index.spec.js',
        '!test/light-dom/multiple-templates/index.spec.js',
        '!test/light-dom/style-global/index.spec.js',
        '!test/light-dom/slotting/index.spec.js',
        '!test/light-dom/synthetic-shadow-styles/index.spec.js',
        '!test/light-dom/host-pseudo/index.spec.js',
        '!test/light-dom/scoped-styles/index.spec.js',
        '!test/mixed-shadow-mode/composed-path/index.spec.js',
        '!test/mixed-shadow-mode/reporting/index.spec.js',
        '!test/mixed-shadow-mode/synthetic-behavior/index.spec.js',
        '!test/native-shadow/Event-methods/Event.composedPath.spec.js',
        '!test/polyfills/document-body-properties/index.spec.js',
        '!test/profiler/mutation-logging/index.spec.js',
        '!test/profiler/sanity/profiler.spec.js',
        '!test/regression/invalid-key/index.spec.js',
        '!test/rendering/callback-invocation-order/index.spec.js',
        '!test/rendering/elements-are-not-recycled/index.spec.js',
        '!test/rendering/fragment-cache/index.spec.js',
        '!test/rendering/iframe/index.spec.js',
        '!test/rendering/inner-outer-html/index.spec.js',
        '!test/rendering/legacy-scope-tokens/index.spec.js',
        '!test/rendering/native-only-css/index.spec.js',
        '!test/rendering/sanitize-stylesheet-token/index.spec.js',
        '!test/rendering/slotting/index.spec.js',
        '!test/rendering/stylesheet-caching/index.spec.js',
        '!test/shadow-dom/MutationObserver/MutationObserver.spec.js',
        '!test/shadow-dom/Node-properties/Node.hasChildNodes.spec.js',
        '!test/shadow-dom/Node-properties/Node.textContent.spec.js',
        '!test/shadow-dom/ShadowRoot-properties/ShadowRoot.spec.js',
        '!test/shadow-dom/ShadowRoot.elementsFromPoint/index.spec.js',
        '!test/shadow-dom/event-in-shadow-tree/propagation.spec.js',
        '!test/signal/protocol/index.spec.js',
        '!test/synthetic-shadow/active-element/index.spec.js',
        '!test/swapping/styles/index.spec.js',
        '!test/synthetic-shadow/global-styles/index.spec.js',
        '!test/shadow-dom/multiple-templates/index.spec.js',
        '!test/shadow-dom/Node-properties/Node.childNodes.spec.js',
        '!test/synthetic-shadow/inner-outer-text/inner-outer-text.spec.js',
        '!test/synthetic-shadow/scoped-id/multiple-idrefs.spec.js',
        '!test/synthetic-shadow/dom-manual-sharing-nodes/index.spec.js',
        '!test/synthetic-shadow/host-pseudo/index.spec.js',
        '!test/template/directive-for-each/index.spec.js',
        '!test/wire/legacy-adapters/index.spec.js',
        '!test/wire/wirecontextevent-legacy/index.spec.js',
        '!test/component/LightningElement.attachInternals/api/index.spec.js',
        '!test/light-dom/scoped-slot/if-block/index.spec.js',
        '!test/light-dom/slot-fowarding/slots/duplicates/index.spec.js',
        '!test/rendering/programmatic-stylesheets/index.spec.js',
        '!test/synthetic-shadow/style-svg/index.spec.js',
        '!test/rendering/slot-not-at-top-level/element/shadow/index.spec.js',
        '!test/rendering/slot-not-at-top-level/external/shadow/index.spec.js',
        '!test/rendering/slot-not-at-top-level/ifTrue/shadow/index.spec.js',
        '!test/rendering/slot-not-at-top-level/lwcIf/shadow/index.spec.js',
        '!test/misc/clean-dom/index.spec.js',
        '!test/polyfills/document-properties/index.spec.js',
        '!test/shadow-dom/Event-properties/Event.target.spec.js',
        '!test/synthetic-shadow/element-api/element-api.spec.js',
        '!test/template/directive-if/index.spec.js',
        '!test/light-dom/slot-fowarding/slots/forwarding/index.spec.js',
    ],
    nodeResolve: true,
    rootDir: import.meta.dirname,
    plugins: [
        {
            resolveImport({ source }) {
                if (source === 'test-utils') {
                    return '/helpers/wtr-utils.mjs';
                } else if (source === 'wire-service') {
                    return '@lwc/wire-service';
                }
            },
            async serve(ctx) {
                if (ctx.path.endsWith('.spec.js')) {
                    return await customRollup(ctx);
                }
            },
            async transform(ctx) {
                if (ctx.type === 'application/javascript') {
                    return ctx.body.replace(/process\.env\.NODE_ENV === 'test-karma-lwc'/g, 'true');
                }
            },
        },
    ],
    testRunnerHtml: (testFramework) =>
        `<!DOCTYPE html>
        <html>
          <body>
            <script type="module">
            globalThis.process = ${JSON.stringify({ env })};
            globalThis.lwcRuntimeFlags = ${JSON.stringify({
                DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE:
                    env.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
            })};
            </script>
            <script type="module" src="./helpers/setup.mjs"></script>
            <script type="module" src="./helpers/wtr-utils.mjs"></script>
            <script type="module" src="${testFramework}"></script>
          </body>
        </html>`,
};
