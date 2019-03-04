/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * @deprecated use Element.shadowRoot directly instead.
 *
 * Returns the shadowRoot property of a given Lightning web component.
 *
 * @param {LWCElement} element The Lightning web component element to retrieve
 * the shadowRoot property off of
 * @returns {ShadowRoot} The shadow root of the given element
 */
module.exports.getShadowRoot = function(element) {
    // eslint-disable-next-line no-console
    console.warn(
        '[LWC deprecation notice] getShadowRoot has been deprecated. Access the Element.shadowRoot property directly instead'
    );
    return element.shadowRoot;
};
