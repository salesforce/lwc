/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as lwc from 'lwc';
import { vi } from 'vitest';

vi.stubGlobal('LWC', { ...lwc });
vi.stubGlobal('spyOn', vi.spyOn);

export function createSpy() {
    const spy = vi.fn();

    Object.defineProperty(spy, 'calls', {
        value: {
            allArgs() {
                return spy.mock.calls;
            },
        },
    });

    return spy;
}

vi.stubGlobal('jasmine', {
    createSpy,
    objectContaining: expect.objectContaining,
});

declare global {
    var LWC: typeof lwc;
    var spyOn: typeof vi.spyOn;
    var jasmine: {
        createSpy: typeof createSpy;
        objectContaining: typeof expect.objectContaining;
    };

    interface Window {
        __lwcResetGlobalStylesheets: () => void;
        __lwcResetAlreadyLoggedMessages: () => void;
    }
}

// Global beforeEach/afterEach/etc logic to run before and after each test

var knownChildren: any[] | undefined;
var knownAdoptedStyleSheets: CSSStyleSheet[] | undefined;

function getHeadChildren() {
    return Array.prototype.slice.apply(document.head.children);
}

function getBodyChildren() {
    return Array.prototype.slice.apply(document.body.children);
}

function getAdoptedStyleSheets() {
    return Array.prototype.slice.call(document.adoptedStyleSheets || []);
}

// After each test, clean up any DOM elements that were inserted into the document
// <head> or <body>, plus any global <style>s or adopted style sheets.

function getChildren() {
    return ([] as any[]).concat(getHeadChildren()).concat(getBodyChildren());
}

beforeEach(function () {
    knownChildren = getChildren();
    knownAdoptedStyleSheets = getAdoptedStyleSheets();
});

let consoleCallCount = 0;

afterEach(function () {
    getChildren().forEach(function (child) {
        if (knownChildren!.indexOf(child) === -1) {
            child.parentElement.removeChild(child);
        }
    });
    if (document.adoptedStyleSheets) {
        document.adoptedStyleSheets = knownAdoptedStyleSheets!;
    }
    knownChildren = undefined;
    knownAdoptedStyleSheets = undefined;
    // Need to clear this or else the engine will think there's a <style> in the <head>
    // that already has the style, even though we just removed it
    window.__lwcResetGlobalStylesheets();
    // Certain logs only appear once; we want to reset these between tests
    window.__lwcResetAlreadyLoggedMessages();

    consoleCallCount = 0;
});

// Patch console.error/console.warn, etc. so if it's called, we throw
function patchConsole() {
    (['error', 'warn'] as const).forEach(function (method) {
        var originalMethod = window.console[method];
        window.console[method] = function () {
            consoleCallCount++;
            return originalMethod.apply(this, Array.from(arguments));
        };
    });
}

function throwIfConsoleCalled() {
    if (consoleCallCount) {
        throw new Error(
            'Expected console not to be called, but was called ' + consoleCallCount + ' time(s)'
        );
    }
}

// Run some logic before all tests have run and after all tests have run to ensure that
// no test dirtied the DOM with leftover elements
var originalHeadChildren: any[];
var originalBodyChildren: any[];
var originalAdoptedStyleSheets: any[];
beforeAll(function () {
    originalHeadChildren = getHeadChildren();
    originalBodyChildren = getBodyChildren();
    originalAdoptedStyleSheets = getAdoptedStyleSheets();
    patchConsole();
});

// Throwing an Error in afterAll will cause a non-zero exit code
afterAll(function () {
    var headChildren = getHeadChildren();
    var bodyChildren = getBodyChildren();
    var adoptedStyleSheets = getAdoptedStyleSheets();

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

    adoptedStyleSheets.forEach(function (sheet, i) {
        if (originalAdoptedStyleSheets[i] !== sheet) {
            throw new Error(
                'Unexpected adopted style sheet left in the document by a test: ' + sheet
            );
        }
    });

    throwIfConsoleCalled();
});

// The default of 5000ms seems to get surpassed frequently in Safari 14 in SauceLabs
vi.setConfig({
    testTimeout: 60000,
});

// Extend the Window interface to include the __lwcResetGlobalStylesheets property
import './test-matchers';
