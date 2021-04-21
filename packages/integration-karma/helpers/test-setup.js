/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Global beforeEach/afterEach/etc logic to run before and after each test

let knownChildren;

// After each test, clean up any DOM elements that were inserted into the document
// <head> or <body>, plus any global <style>s the engine might think are there.

beforeEach(() => {
    knownChildren = new Set([...document.head.children, ...document.body.children]);
});

afterEach(() => {
    for (const child of [...document.head.children, ...document.body.children]) {
        if (!knownChildren.has(child)) {
            child.remove();
        }
    }
    knownChildren = undefined;
    // Need to clear this or else the engine will think there's a <style> in the <head>
    // that already has the style, even though we just removed it
    for (const key of Object.keys(window.__lwcGlobalStylesheets)) {
        delete window.__lwcGlobalStylesheets[key];
    }
});
