/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Global beforeEach/afterEach/etc logic to run before and after each test

var knownChildren;

// After each test, clean up any DOM elements that were inserted into the document
// <head> or <body>, plus any global <style>s the engine might think are there.

function getChildren() {
    return []
        .concat(Array.prototype.slice.apply(document.head.children))
        .concat(Array.prototype.slice.apply(document.body.children));
}

beforeEach(function () {
    knownChildren = getChildren();
});

afterEach(function () {
    getChildren().forEach(function (child) {
        if (knownChildren.indexOf(child) === -1) {
            child.parentElement.removeChild(child);
        }
    });
    knownChildren = undefined;
    // Need to clear this or else the engine will think there's a <style> in the <head>
    // that already has the style, even though we just removed it
    window.__lwcResetGlobalStylesheets();
});
