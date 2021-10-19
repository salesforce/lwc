/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

window.HydrateTest = (function (lwc) {
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

        const testTarget = fragment.querySelector('x-main');
        if (!browserSupportsDeclarativeShadowDOM) {
            polyfillDeclarativeShadowDom(testTarget);
        }
        div.appendChild(testTarget);

        document.body.appendChild(div);

        return div;
    }

    function runTest(ssrRendered, Component, testConfig) {
        const container = appendTestTarget(ssrRendered);
        let target = container.querySelector('x-main');

        const snapshot = testConfig.snapshot ? testConfig.snapshot(target) : {};

        const props = testConfig.props || {};
        const clientProps = testConfig.clientProps || props;
        lwc.hydrateComponent(target, Component, clientProps);

        // let's select again the target, it should be the same elements as in the snapshot
        target = container.querySelector('x-main');
        return testConfig.test(target, snapshot);
    }

    return {
        runTest,
    };
})(LWC);
