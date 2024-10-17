/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as lwc from 'lwc';
import testUtils from './test-utils';

testUtils.setHooks({
    sanitizeHtmlContent: (content) => content as string,
});

// As of this writing, Firefox does not support programmatic access to parsing DSD,
// i.e. `Document.parseHTMLUnsafe`
// See: https://developer.mozilla.org/en-US/docs/Web/API/Document/parseHTMLUnsafe_static
function testSupportsProgrammaticDSD() {
    const html = '<div><template shadowrootmode="open"></template></div>';
    try {
        // @ts-expect-error Document is not defined
        return !!Document.parseHTMLUnsafe(html).body.firstChild!.shadowRoot;
    } catch (_err) {
        return false;
    }
}

const browserSupportsProgrammaticDSD = testSupportsProgrammaticDSD();

function parseStringToDom(html: string) {
    if (browserSupportsProgrammaticDSD) {
        return Document.parseHTMLUnsafe(html).body.firstChild;
    } else {
        return new DOMParser().parseFromString(html, 'text/html').body.firstChild;
    }
}

function polyfillDeclarativeShadowDom(root: any) {
    root.querySelectorAll('template[shadowrootmode]').forEach((template: any) => {
        const mode = template.getAttribute('shadowrootmode');
        const shadowRoot = template.parentNode!.attachShadow({ mode });
        shadowRoot.appendChild(template.content);
        template.remove();

        polyfillDeclarativeShadowDom(shadowRoot);
    });
}

function appendTestTarget(ssrText: string) {
    const div = document.createElement('div');

    const testTarget = parseStringToDom(ssrText);
    if (!browserSupportsProgrammaticDSD) {
        polyfillDeclarativeShadowDom(testTarget);
    }
    div.appendChild(testTarget!);

    document.body.appendChild(div);

    return div;
}

type TestConfig = {
    test?: (target: Element, snapshot: any, consoleCalls: any) => any;
    advancedTest?: (
        target: Element,
        options: {
            Component: any;
            hydrateComponent: (elm: Element, Component: any, props: any) => void;
            consoleSpy: any;
            container: Element;
            selector: string;
        }
    ) => any;
    snapshot?: (target: Element) => any;
    props?: any;
    clientProps?: any;
};

export function runTest(
    ssrRendered: string,
    Component: any,
    testConfig: TestConfig,
    error: Error | null
) {
    if (error) {
        throw error;
    }

    const container = appendTestTarget(ssrRendered);
    // @ts-expect-error querySelector is not defined
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
