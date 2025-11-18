/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayFrom, ArrayJoin, ArrayMap, ArrayPush } from '@lwc/shared';
import { logWarnOnce } from '../shared/logger';

let globalStylesheet: CSSStyleSheet | undefined;

function isStyleElement(elm: Element): elm is HTMLStyleElement {
    return elm.tagName === 'STYLE';
}

async function fetchStylesheet(elm: HTMLStyleElement | HTMLLinkElement) {
    if (isStyleElement(elm)) {
        return elm.textContent;
    } else {
        // <link>
        const { href } = elm;
        try {
            return await (await fetch(href)).text();
        } catch (_err) {
            logWarnOnce(`Ignoring cross-origin stylesheet in migrate mode: ${href}`);
            // ignore errors with cross-origin stylesheets - nothing we can do for those
            return '';
        }
    }
}

function initGlobalStylesheet() {
    const stylesheet = new CSSStyleSheet();
    const elmsToPromises = new Map();
    let lastSeenLength = 0;

    const copyToGlobalStylesheet = () => {
        const elms = document.head.querySelectorAll(
            'style:not([data-rendered-by-lwc]),link[rel="stylesheet"]'
        );
        if (elms.length === lastSeenLength) {
            return; // nothing to update
        }
        lastSeenLength = elms.length;
        const promises = ArrayMap.call(ArrayFrom(elms), (elm) => {
            let promise = elmsToPromises.get(elm);
            if (!promise) {
                promise = fetchStylesheet(elm as HTMLStyleElement | HTMLLinkElement);
                elmsToPromises.set(elm, promise);
            }
            return promise;
        });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.all(promises).then((stylesheetTexts) => {
            // When replaceSync() is called, the entire contents of the constructable stylesheet are replaced
            // with the copied+concatenated styles. This means that any shadow root's adoptedStyleSheets that
            // contains this constructable stylesheet will immediately get the new styles.
            stylesheet.replaceSync(ArrayJoin.call(stylesheetTexts, '\n'));
        });
    };

    const headObserver = new MutationObserver(copyToGlobalStylesheet);

    // By observing only the childList, note that we are not covering the case where someone changes an `href`
    // on an existing <link>`, or the textContent on an existing `<style>`. This is assumed to be an uncommon
    // case and not worth covering.
    headObserver.observe(document.head, {
        childList: true,
    });

    copyToGlobalStylesheet();

    return stylesheet;
}

export function applyShadowMigrateMode(shadowRoot: ShadowRoot) {
    if (!globalStylesheet) {
        globalStylesheet = initGlobalStylesheet();
    }

    (shadowRoot as any).synthetic = true; // pretend to be synthetic mode
    ArrayPush.call(shadowRoot.adoptedStyleSheets, globalStylesheet);
}
