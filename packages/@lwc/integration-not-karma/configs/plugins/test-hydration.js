import { spyOn } from '@vitest/spy';
import * as LWC from 'lwc';
import { setHooks } from '../../helpers/hooks';

/*
 * Because these tests are written in JS, the type defs below are not enforced. They are provided
 * solely as documentation. They can be used as IDE autocomplete if the test configs are annotated
 * with the JSDoc below (the number of ../ may need to be adjusted):
 /** @type {import('../../../configs/plugins/test-hydration.js').HydrationTestConfig} */

/**
 * @typedef {object} TestConfig
 *   Exactly one of `test` or `advancedTest` must be defined. All other properties are optional.
 *   `snapshot` is ignored if `advancedTest` is defined.
 * @property {Record<string, string>} [props]
 *   Props to provide for the root test component.
 * @property {Record<string, string} [clientProps]
 *   Client-side props to hydrate the root test component.
 * @property {string[]} [requiredFeatureFlags]
 *   List of feature flags that should be enabled for the test.
 * @property {SnapshotFunc} [snapshot]
 *   A function that can be used to capture the pre-hydration state of the page.
 *   Only used if `test` is defined.
 * @property {TestFunc} [test]
 *   A function that contains assertions, run after hydration.
 *   Should be used if asserting the pre-hydration state is not required.
 * @property {AdvancedTestFunc} [advancedTest]
 *   A function that contains assertions and is also responsible for hydrating the page.
 *   Should only be used if assertions are required before hydration.
 */

/**
 * @callback SnapshotFunc
 *   Captures a snapshot of the page before hydration.
 * @param {HTMLElement} component
 *   The root test component, corresponding to the `c-main` component.
 * @returns {unknown}
 *   Any data required for test assertions.
 */

/**
 * @callback TestFunc
 *   Asserts the state of the page after hydration has occurred.
 * @param {HTMLElement} target
 *   The root test element, corresponding to the `c-main` component.
 * @param {unknown} snapshot
 *   The result of the `snapshot` function, if defined.
 * @param {Record<'log' | 'warn' | 'error', unknown[][]>} calls
 *   Console calls that occurred during hydration.
 * @returns {void}
 */

/**
 * @callback AdvancedTestFunc
 *   Asserts the state of the page before and after hydration has occurred.
 *   Is responsible for calling `hydrateComponent`.
 * @param {HTMLElement} target
 *   The root test element, corresponding to the `c-main` component.
 * @param {object} utils
 *   Various things helpful for making assertions.
 * @param {import('lwc').LightningElement} utils.Component
 *   The constructor for the root test component (`c-main`).
 * @param {import('lwc').hydrateComponent} utils.hydrateComponent
 *   A bound instance of `hydrateComponent`. Must be called for tests to pass.
 * @param {Record<'log' | 'warn' | 'error', unknown[][]> & {reset: () => void}} utils.consoleSpy
 *   A spy on `console` to track calls. Calling `reset` empties the tracked calls.
 * @param {HTMLDivElement} utils.container
 *   The parent of the test root element.
 * @param {'c-main'} utils.selector
 *   The selector of the root test element.
 * @returns {void}
 */

setHooks({ sanitizeHtmlContent: (content) => content });

function parseStringToDom(html) {
    return Document.parseHTMLUnsafe(html).body.firstChild;
}

/**
 * A much simplified version of the spies originally used for Karma.
 * Should probably be eventually replaced with individual spies.
 */
export function spyConsole() {
    const log = spyOn(console, 'log');
    const warn = spyOn(console, 'warn');
    const error = spyOn(console, 'error');
    return {
        calls: {
            log: log.mock.calls,
            warn: warn.mock.calls,
            error: error.mock.calls,
        },
        reset() {
            log.mockRestore();
            warn.mockRestore();
            error.mockRestore();
        },
    };
}

function appendTestTarget(ssrText) {
    const div = document.createElement('div');
    const testTarget = parseStringToDom(ssrText);
    div.appendChild(testTarget);
    document.body.appendChild(div);
    return div;
}

function setFeatureFlags(requiredFeatureFlags, value) {
    requiredFeatureFlags?.forEach((featureFlag) => {
        LWC.setFeatureFlagForTest(featureFlag, value);
    });
}

// Must be sync to properly register tests; async behavior can happen in before/after blocks
export function runTest(configPath, componentPath, ssrRendered) {
    const description = new URL(configPath, location.href).pathname;
    let consoleSpy;
    let testConfig;
    let Component;

    beforeAll(async () => {
        testConfig = (await import(configPath)).default;
        Component = (await import(componentPath)).default;
        setFeatureFlags(testConfig.requiredFeatureFlags, true);
    });

    beforeEach(async () => {
        consoleSpy = spyConsole();
    });

    afterEach(() => {
        consoleSpy.reset();
    });

    afterAll(() => {
        setFeatureFlags(testConfig.requiredFeatureFlags, false);
    });

    it(description, async () => {
        const container = appendTestTarget(ssrRendered);
        const selector = container.firstChild.tagName.toLowerCase();
        let target = container.querySelector(selector);

        if (testConfig.test) {
            const snapshot = testConfig.snapshot ? testConfig.snapshot(target) : {};

            const props = testConfig.props || {};
            const clientProps = testConfig.clientProps || props;

            LWC.hydrateComponent(target, Component, clientProps);

            // let's select again the target, it should be the same elements as in the snapshot
            target = container.querySelector(selector);
            await testConfig.test(target, snapshot, consoleSpy.calls);
        } else if (testConfig.advancedTest) {
            let hydrated = false;
            // We can't spy on LWC because it's an ESM module, so we just wrap it
            const hydrateComponent = (...args) => {
                hydrated = true;
                return LWC.hydrateComponent(...args);
            };
            await testConfig.advancedTest(target, {
                Component,
                hydrateComponent,
                consoleSpy,
                container,
                selector,
            });
            // Sanity check: if we've never hydrated then we haven't set up the test correctly
            expect(hydrated).toBe(true);
        } else {
            throw new Error(`Missing test or advancedTest function in ${configPath}.`);
        }
    });
}
