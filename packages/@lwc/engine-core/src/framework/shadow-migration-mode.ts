/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
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
        } catch (err) {
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
        const promises = [...(elms as unknown as Iterable<HTMLStyleElement | HTMLLinkElement>)].map(
            (elm) => {
                let promise = elmsToPromises.get(elm);
                if (!promise) {
                    // Cache the promise
                    promise = fetchStylesheet(elm);
                    elmsToPromises.set(elm, promise);
                }
                return promise;
            }
        );
        Promise.all(promises).then((stylesheetTexts) => {
            stylesheet.replaceSync(stylesheetTexts.join('\n'));
        });
    };

    const headObserver = new MutationObserver(copyToGlobalStylesheet);
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

    // (shadowRoot as any).synthetic = true; // pretend to be synthetic mode
    shadowRoot.adoptedStyleSheets.push(globalStylesheet);
}
