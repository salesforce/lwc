/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

type RootNode = Node & DocumentOrShadowRoot & NonElementParentNode;

const stylesheetCache = new Map();

class StyleDeduplicator extends HTMLElement {
    connectedCallback() {
        const styleId = this.getAttribute('style-id');

        if (!styleId) {
            throw new Error('"style-id" attribute must be supplied for <lwc-style> element');
        }

        const root = this.getRootNode() as RootNode;
        let stylesheet = stylesheetCache.get(styleId);

        if (stylesheet) {
            root.adoptedStyleSheets.push(stylesheet);
        } else {
            stylesheet = new CSSStyleSheet();
            const element = root.getElementById(styleId);

            if (!element) {
                throw new Error(
                    `<lwc-style> tag found with no corresponding <style id="${styleId}"> tag`
                );
            }

            stylesheet.replaceSync(element.innerHTML);
            stylesheetCache.set(styleId, stylesheet);
        }

        this.remove();
    }
}

/**
 * This function should be called in a <script> tag in the <head>
 * before server-rendered markup is encountered while parsing an HTML
 * document. This ensures that deduplicated styles will be in effect
 * for components that insert an <lwc-style> tag in place of a full
 * stylesheet.
 */
export function registerLwcStyleComponent() {
    customElements.define('lwc-style', StyleDeduplicator);
}
