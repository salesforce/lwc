/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Global beforeEach/afterEach/etc logic to run before and after each test

var knownBodyChildren;

// After each test, clean up any DOM elements that were inserted into the document <body>
function getBodyChildren() {
    return Array.prototype.slice.apply(document.body.children);
}

beforeEach(function () {
    knownBodyChildren = getBodyChildren();
});

afterEach(function () {
    getBodyChildren().forEach(function (child) {
        if (knownBodyChildren.indexOf(child) === -1) {
            child.parentElement.removeChild(child);
        }
    });
    knownBodyChildren = undefined;
});

// Run some logic before all tests have run and after all tests have run to ensure that
// no test dirtied the DOM with leftover elements
var originalBodyChildren;
beforeAll(function () {
    originalBodyChildren = Array.prototype.slice.call(document.body.children);
});

// Throwing an Error in afterAll will cause a non-zero exit code
afterAll(function () {
    var bodyChildren = Array.prototype.slice.call(document.body.children);

    bodyChildren.forEach(function (child, i) {
        if (originalBodyChildren[i] !== child) {
            throw new Error('Unexpected element left in the <body> by a test: ' + child.outerHTML);
        }
    });
});
