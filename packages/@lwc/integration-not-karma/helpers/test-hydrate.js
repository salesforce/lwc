import * as LWC from 'lwc';
import { spyConsole } from './console';
import { setHooks } from './hooks';

setHooks({ sanitizeHtmlContent: (content) => content });

function parseStringToDom(html) {
    return Document.parseHTMLUnsafe(html).body.firstChild;
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

async function runTest(ssrRendered, Component, testConfig) {
    const container = appendTestTarget(ssrRendered);
    const selector = container.firstChild.tagName.toLowerCase();
    let target = container.querySelector(selector);

    let testResult;
    const consoleSpy = spyConsole();
    setFeatureFlags(testConfig.requiredFeatureFlags, true);

    if (testConfig.test) {
        const snapshot = testConfig.snapshot ? testConfig.snapshot(target) : {};

        const props = testConfig.props || {};
        const clientProps = testConfig.clientProps || props;

        LWC.hydrateComponent(target, Component, clientProps);

        // let's select again the target, it should be the same elements as in the snapshot
        target = container.querySelector(selector);
        testResult = await testConfig.test(target, snapshot, consoleSpy.calls);
    } else if (testConfig.advancedTest) {
        testResult = await testConfig.advancedTest(target, {
            Component,
            hydrateComponent: LWC.hydrateComponent.bind(LWC),
            consoleSpy,
            container,
            selector,
        });
    }

    consoleSpy.reset();

    return testResult;
}

export { runTest };
