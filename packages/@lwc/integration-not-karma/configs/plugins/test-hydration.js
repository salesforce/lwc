import { spyOn } from '@vitest/spy';
import * as LWC from 'lwc';
import { setHooks } from '../../helpers/hooks';

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
export function runTest(configPath, componentPath, ssrRendered, focused) {
    const test = focused ? it.only : it;
    const description = new URL(configPath, location.href).pathname;
    let consoleSpy;
    let testConfig;
    let Component;

    beforeAll(async () => {
        testConfig = await import(configPath);
        Component = await import(componentPath);
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

    test(description, async () => {
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
            await testConfig.advancedTest(target, {
                Component,
                hydrateComponent: LWC.hydrateComponent.bind(LWC),
                consoleSpy,
                container,
                selector,
            });
        }
    });
}
