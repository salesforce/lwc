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

    // As of this writing, Firefox does not support programmatic access to parsing DSD,
    // i.e. `Document.parseHTMLUnsafe`
    // See: https://developer.mozilla.org/en-US/docs/Web/API/Document/parseHTMLUnsafe_static
    function testSupportsProgrammaticDSD() {
        const html = '<div><template shadowrootmode="open"></template></div>';
        try {
            return !!Document.parseHTMLUnsafe(html).body.firstChild.shadowRoot;
        } catch (err) {
            return false;
        }
    }

    const browserSupportsProgrammaticDSD = testSupportsProgrammaticDSD();

    function parseStringToDom(html) {
        if (browserSupportsProgrammaticDSD) {
            return Document.parseHTMLUnsafe(html).body.firstChild;
        } else {
            return new DOMParser().parseFromString(html, 'text/html').body.firstChild;
        }
    }

    function polyfillDeclarativeShadowDom(root) {
        root.querySelectorAll('template[shadowrootmode]').forEach((template) => {
            const mode = template.getAttribute('shadowrootmode');
            const shadowRoot = template.parentNode.attachShadow({ mode });
            shadowRoot.appendChild(template.content);
            template.remove();

            polyfillDeclarativeShadowDom(shadowRoot);
        });
    }

    function appendTestTarget(ssrText) {
        const div = document.createElement('div');

        const testTarget = parseStringToDom(ssrText);
        if (!browserSupportsProgrammaticDSD) {
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
                container,
                selector,
            });
        }

        consoleSpy.reset();

        return testResult;
    }

    return {
        runTest,
    };
})(window.LWC, window.TestUtils);
