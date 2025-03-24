/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

window.HydrateTest = (function (lwc, testUtils) {
    testUtils.setHooks({
        sanitizeHtmlContent: (content) => content,
    });

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

    function runTest(ssrRendered, Component, testConfig) {
        const container = appendTestTarget(ssrRendered);
        const selector = container.firstChild.tagName.toLowerCase();
        let target = container.querySelector(selector);

        let testResult;
        const consoleSpy = testUtils.spyConsole();

        if (testConfig.test) {
            const snapshot = testConfig.snapshot ? testConfig.snapshot(target) : {};

            const props = testConfig.props || {};
            const clientProps = testConfig.clientProps || props;

            lwc.hydrateComponent(target, Component, clientProps);

            // let's select again the target, it should be the same elements as in the snapshot
            target = container.querySelector(selector);
            testResult = testConfig.test(target, snapshot, consoleSpy.calls);
        } else if (testConfig.advancedTest) {
            testResult = testConfig.advancedTest(target, {
                Component,
                hydrateComponent: lwc.hydrateComponent.bind(lwc),
                consoleSpy,
                container,
                selector,
            });
        }

        consoleSpy.reset();

        return testResult;
    }

    return { runTest };
})(window.LWC, window.TestUtils);
