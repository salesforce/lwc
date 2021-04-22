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

// Run some logic before all tests have run and after all tests have run to ensure that
// no test dirtied the DOM with leftover elements
var originalHeadChildren;
var originalBodyChildren;
beforeAll(function () {
    originalHeadChildren = Array.prototype.slice.call(document.head.children);
    originalBodyChildren = Array.prototype.slice.call(document.body.children);
});

// There's no way I'm aware of to run a test after every other test has run, so we just throw
// an error in the afterAll() here if the test fails. This causes the test process to exit
// with a non-zero exit code.
afterAll(function () {
    var headChildren = Array.prototype.slice.call(document.head.children);
    var bodyChildren = Array.prototype.slice.call(document.body.children);

    headChildren.forEach(function (child, i) {
        if (originalHeadChildren[i] !== child) {
            throw new Error('Unexpected element left in the <head> by a test: ' + child.outerHTML);
        }
    });

    bodyChildren.forEach(function (child, i) {
        if (originalBodyChildren[i] !== child) {
            throw new Error('Unexpected element left in the <body> by a test: ' + child.outerHTML);
        }
    });
});
