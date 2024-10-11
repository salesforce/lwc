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
});

// Run some logic before all tests have run and after all tests have run to ensure that
// no test dirtied the DOM with leftover elements
var originalHeadChildren: any[];
var originalBodyChildren: any[];
var originalAdoptedStyleSheets: any[];

beforeAll(function () {
    originalHeadChildren = getHeadChildren();
    originalBodyChildren = getBodyChildren();
    originalAdoptedStyleSheets = getAdoptedStyleSheets();
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
});
