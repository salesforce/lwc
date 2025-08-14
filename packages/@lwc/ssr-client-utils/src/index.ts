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
            const placeholder = document.createElement('style');
            placeholder.setAttribute('type', 'text/css');

            // TODO [#2869]: `<style>`s should not have scope token classes but they are required for hydration to function correctly (W-19087941).
            this.classList.forEach((className) => placeholder.classList.add(className));

            // Not-first <lwc-style> should be replaced with a placeholder <style>, since that's
            // what the diffing algorithm and hydration logic will expect to find
            this.replaceWith(placeholder);
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
            // The first <lwc-style> should be removed, because it already has a <style> next to it
            this.remove();
        }
    }
}

/**
 * This function should be called in a <script> tag in the <head>
 * before server-rendered markup is encountered while parsing an HTML
 * document. This ensures that deduplicated styles will be in effect
 * for components that insert an <lwc-style> tag in place of a full
 * stylesheet.
 * It can also be implicitly invoked by importing `@lwc/ssr-client-utils/register-lwc-style` as a bare import.
 */
export function registerLwcStyleComponent() {
    customElements.define('lwc-style', StyleDeduplicator);
}

// Only used in LWC's Karma tests
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test-karma-lwc') {
    (window as any).__lwcClearStylesheetCache = () => stylesheetCache.clear();
}
