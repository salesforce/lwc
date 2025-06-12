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
        // Using ../integration-karma for now, rather than copying the tests here, because there are
        // over 3000 test files and that makes the diff really annoying.
        '../integration-karma/test/**/*.spec.js',
        // Failing Karma tests that need to be migrated to WTR
        '!../integration-karma/test/custom-elements-registry/index.spec.js',
        '!../integration-karma/test/spread/index.spec.js',
        '!../integration-karma/test/static-content/index.spec.js',
        '!../integration-karma/test/wire/reactive-params.spec.js',
        '!../integration-karma/test/accessibility/synthetic-cross-root-aria/index.spec.js',
        '!../integration-karma/test/api/CustomElementConstructor-getter/index.spec.js',
        '!../integration-karma/test/api/isNodeFromTemplate/index.spec.js',
        '!../integration-karma/test/api/readonly/index.spec.js',
        '!../integration-karma/test/api/registerTemplate/index.spec.js',
        '!../integration-karma/test/api/sanitizeAttribute/index.spec.js',
        '!../integration-karma/test/api/sanitizeHtmlContent/index.spec.js',
        '!../integration-karma/test/component/LightningElement/index.spec.js',
        '!../integration-karma/test/component/LightningElement.addEventListener/index.spec.js',
        '!../integration-karma/test/component/LightningElement.errorCallback/index.spec.js',
        '!../integration-karma/test/component/LightningElement.render/index.spec.js',
        '!../integration-karma/test/component/lifecycle-callbacks/index.spec.js',
        '!../integration-karma/test/component/native-vs-synthetic-lifecycle/index.spec.js',
        '!../integration-karma/test/events/focus-event-related-target/index.spec.js',
        '!../integration-karma/test/integrations/locker/index.spec.js',
        '!../integration-karma/test/light-dom/ids/index.spec.js',
        '!../integration-karma/test/light-dom/multiple-templates/index.spec.js',
        '!../integration-karma/test/light-dom/style-global/index.spec.js',
        '!../integration-karma/test/light-dom/slotting/index.spec.js',
        '!../integration-karma/test/light-dom/synthetic-shadow-styles/index.spec.js',
        '!../integration-karma/test/light-dom/host-pseudo/index.spec.js',
        '!../integration-karma/test/light-dom/scoped-styles/index.spec.js',
        '!../integration-karma/test/mixed-shadow-mode/composed-path/index.spec.js',
        '!../integration-karma/test/mixed-shadow-mode/reporting/index.spec.js',
        '!../integration-karma/test/mixed-shadow-mode/synthetic-behavior/index.spec.js',
        '!../integration-karma/test/native-shadow/Event-methods/Event.composedPath.spec.js',
        '!../integration-karma/test/polyfills/document-body-properties/index.spec.js',
        '!../integration-karma/test/profiler/mutation-logging/index.spec.js',
        '!../integration-karma/test/profiler/sanity/profiler.spec.js',
        '!../integration-karma/test/regression/invalid-key/index.spec.js',
        '!../integration-karma/test/rendering/callback-invocation-order/index.spec.js',
        '!../integration-karma/test/rendering/elements-are-not-recycled/index.spec.js',
        '!../integration-karma/test/rendering/fragment-cache/index.spec.js',
        '!../integration-karma/test/rendering/iframe/index.spec.js',
        '!../integration-karma/test/rendering/inner-outer-html/index.spec.js',
        '!../integration-karma/test/rendering/legacy-scope-tokens/index.spec.js',
        '!../integration-karma/test/rendering/native-only-css/index.spec.js',
        '!../integration-karma/test/rendering/sanitize-stylesheet-token/index.spec.js',
        '!../integration-karma/test/rendering/slotting/index.spec.js',
        '!../integration-karma/test/rendering/stylesheet-caching/index.spec.js',
        '!../integration-karma/test/shadow-dom/MutationObserver/MutationObserver.spec.js',
        '!../integration-karma/test/shadow-dom/Node-properties/Node.hasChildNodes.spec.js',
        '!../integration-karma/test/shadow-dom/Node-properties/Node.textContent.spec.js',
        '!../integration-karma/test/shadow-dom/ShadowRoot-properties/ShadowRoot.spec.js',
        '!../integration-karma/test/shadow-dom/ShadowRoot.elementsFromPoint/index.spec.js',
        '!../integration-karma/test/shadow-dom/event-in-shadow-tree/propagation.spec.js',
        '!../integration-karma/test/signal/protocol/index.spec.js',
        '!../integration-karma/test/synthetic-shadow/active-element/index.spec.js',
        '!../integration-karma/test/swapping/styles/index.spec.js',
        '!../integration-karma/test/synthetic-shadow/global-styles/index.spec.js',
        '!../integration-karma/test/shadow-dom/multiple-templates/index.spec.js',
        '!../integration-karma/test/shadow-dom/Node-properties/Node.childNodes.spec.js',
        '!../integration-karma/test/synthetic-shadow/inner-outer-text/inner-outer-text.spec.js',
        '!../integration-karma/test/synthetic-shadow/scoped-id/multiple-idrefs.spec.js',
        '!../integration-karma/test/synthetic-shadow/dom-manual-sharing-nodes/index.spec.js',
        '!../integration-karma/test/synthetic-shadow/host-pseudo/index.spec.js',
        '!../integration-karma/test/template/directive-for-each/index.spec.js',
        '!../integration-karma/test/wire/legacy-adapters/index.spec.js',
        '!../integration-karma/test/wire/wirecontextevent-legacy/index.spec.js',
        '!../integration-karma/test/component/LightningElement.attachInternals/api/index.spec.js',
        '!../integration-karma/test/light-dom/scoped-slot/if-block/index.spec.js',
        '!../integration-karma/test/light-dom/slot-fowarding/slots/duplicates/index.spec.js',
        '!../integration-karma/test/rendering/programmatic-stylesheets/index.spec.js',
        '!../integration-karma/test/synthetic-shadow/style-svg/index.spec.js',
        '!../integration-karma/test/rendering/slot-not-at-top-level/element/shadow/index.spec.js',
        '!../integration-karma/test/rendering/slot-not-at-top-level/external/shadow/index.spec.js',
        '!../integration-karma/test/rendering/slot-not-at-top-level/ifTrue/shadow/index.spec.js',
        '!../integration-karma/test/rendering/slot-not-at-top-level/lwcIf/shadow/index.spec.js',
        '!../integration-karma/test/misc/clean-dom/index.spec.js',
        '!../integration-karma/test/polyfills/document-properties/index.spec.js',
        '!../integration-karma/test/shadow-dom/Event-properties/Event.target.spec.js',
        '!../integration-karma/test/synthetic-shadow/element-api/element-api.spec.js',
        '!../integration-karma/test/template/directive-if/index.spec.js',
        '!../integration-karma/test/light-dom/slot-fowarding/slots/forwarding/index.spec.js',
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
