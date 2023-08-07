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

    const browserSupportsDeclarativeShadowDOM = Object.prototype.hasOwnProperty.call(
        HTMLTemplateElement.prototype,
        'shadowRoot'
    );

    function polyfillDeclarativeShadowDom(root) {
        root.querySelectorAll('template[shadowroot]').forEach((template) => {
            const mode = template.getAttribute('shadowroot');
            const shadowRoot = template.parentNode.attachShadow({ mode });
            shadowRoot.appendChild(template.content);
            template.remove();

            polyfillDeclarativeShadowDom(shadowRoot);
        });
    }

    function appendTestTarget(ssrtext) {
        const div = document.createElement('div');
        const fragment = new DOMParser().parseFromString(ssrtext, 'text/html', {
            includeShadowRoots: true,
        });

        const testTarget = fragment.body.firstChild;
        if (!browserSupportsDeclarativeShadowDOM) {
            polyfillDeclarativeShadowDom(testTarget);
        }
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
            });
        }

        consoleSpy.reset();

        return testResult;
    }

    return {
        runTest,
    };
})(window.LWC, window.TestUtils);
