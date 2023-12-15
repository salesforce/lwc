import { createElement } from 'lwc';
import { nativeCustomElementLifecycleEnabled } from 'test-utils';

import XBoundaryChildConstructorThrow from 'x/boundaryChildConstructorThrow';
import XBoundaryChildConnectedThrow from 'x/boundaryChildConnectedThrow';
import XBoundaryChildRenderThrow from 'x/boundaryChildRenderThrow';
import XBoundaryChildRenderedThrow from 'x/boundaryChildRenderedThrow';
import XBoundaryChildSlotThrow from 'x/boundaryChildSlotThrow';
import XNestedBoundaryChildThrow from 'x/nestedBoundaryChildThrow';
import XBoundaryChildSelfRehydrateThrow from 'x/boundaryChildSelfRehydrateThrow';
import XBoundaryAlternativeViewThrow from 'x/boundaryAlternativeViewThrow';
import XBoundaryRenderedThrowFrozen from 'x/boundaryChildRenderedThrowFrozen';

import XChildConstructorThrowDuringInit from 'x/childConstructorThrowDuringInit';
import XChildRenderThrowDuringInit from 'x/childRenderThrowDuringInit';
import XChildRenderedThrowDuringInit from 'x/childRenderedThrowDuringInit';
import XChildConnectedThrowDuringInit from 'x/childConnectedThrowDuringInit';

import XParentThrowsChildConnectedThrows from 'x/parentThrowsChildConnectedThrows';
import XParentThrowsChildConstructorThrows from 'x/parentThrowsChildConstructorThrows';
import XParentThrowsChildRenderThrows from 'x/parentThrowsChildRenderThrows';
import XParentThrowsChildRenderedThrows from 'x/parentThrowsChildRenderedThrows';

import XGrandparentThrowsChildConnectedThrows from 'x/grandparentThrowsChildConnectedThrows';
import XGrandparentThrowsChildConstructorThrows from 'x/grandparentThrowsChildConstructorThrows';
import XGrandparentThrowsChildRenderThrows from 'x/grandparentThrowsChildRenderThrows';
import XGrandparentThrowsChildRenderedThrows from 'x/grandparentThrowsChildRenderedThrows';

import XParentThrowsOnMutateChildConstructorThrows from 'x/parentThrowsOnMutateChildConstructorThrows';
import XParentThrowsOnMutateChildRenderThrows from 'x/parentThrowsOnMutateChildRenderThrows';
import XParentThrowsOnMutateChildRenderedThrows from 'x/parentThrowsOnMutateChildRenderedThrows';
import XParentThrowsOnMutateChildConnectedThrows from 'x/parentThrowsOnMutateChildConnectedThrows';

import XNoThrowOnMutate from 'x/noThrowOnMutate';

describe('error boundary', () => {
    it('should propagate frozen error to errorCallback()', () => {
        const elm = createElement('x-boundary-rendered-throw-frozen', {
            is: XBoundaryRenderedThrowFrozen,
        });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            expect(elm.getErrorMessage()).toEqual('Child threw frozen error in renderedCallback()');
        });
    });

    it('should not add web component stack trace to frozen error', () => {
        const elm = createElement('x-boundary-rendered-throw-frozen', {
            is: XBoundaryRenderedThrowFrozen,
        });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            expect(elm.getErrorWCStack()).toBeUndefined();
        });
    });

    it('should render alternative view if child throws in renderedCallback()', () => {
        const elm = createElement('x-boundary-child-rendered-throw', {
            is: XBoundaryChildRenderedThrow,
        });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const alternativeView = elm.shadowRoot.querySelector('.rendered-callback-alternative');

            expect(alternativeView.textContent).toEqual('renderedCallback alternative view');
            expect(elm.shadowRoot.querySelector('x-child-rendered-throw')).toBe(null);
        });
    });

    it('should render alternative view if child throws in render()', () => {
        const elm = createElement('x-boundary-child-render-throw', {
            is: XBoundaryChildRenderThrow,
        });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const alternativeView = elm.shadowRoot.querySelector('.render-alternative');

            expect(alternativeView.textContent).toEqual('render alternative view');
            expect(elm.shadowRoot.querySelector('x-child-render-throw')).toBe(null);
        });
    });

    it('should render alternative view if child throws in constructor()', () => {
        const elm = createElement('x-boundary-child-constructor-throw', {
            is: XBoundaryChildConstructorThrow,
        });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const alternativeView = elm.shadowRoot.querySelector('.constructor-alternative');

            expect(alternativeView.textContent).toEqual('constructor alternative view');
            expect(elm.shadowRoot.querySelector('x-child-constructor-throw')).toBe(null);
            expect(elm.shadowRoot.querySelector('x-child-constructor-wrapper')).toBe(null);
        });
    });

    it('should render alternative view if child throws in connectedCallback()', () => {
        const elm = createElement('x-boundary-child-connected-throw', {
            is: XBoundaryChildConnectedThrow,
        });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const alternativeView = elm.shadowRoot.querySelector('.connected-callback-alternative');

            expect(alternativeView.textContent).toEqual('connectedCallback alternative view');
            expect(elm.shadowRoot.querySelector('x-child-connected-throw')).toBe(null);
        });
    });

    it('should render alternative view if child slot throws in render()', () => {
        const elm = createElement('x-boundary-child-slot-throw', { is: XBoundaryChildSlotThrow });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const alternativeView = elm.shadowRoot.querySelector('.slot-alternative');

            expect(alternativeView.textContent).toEqual('slot alternative view');
            expect(elm.shadowRoot.querySelector('x-child-slot-host')).toBe(null);
        });
    });

    it('should render alternative view if nested child throws in render()', () => {
        const elm = createElement('x-nested-boundary-child-throw', {
            is: XNestedBoundaryChildThrow,
        });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            const alternativeView = elm.shadowRoot.querySelector('.boundary-alt-view');

            expect(alternativeView.textContent).toEqual('alternative view');
            expect(elm.shadowRoot.querySelector('x-nested-grand-child-throw')).toBe(null);
        });
    });

    it('should render alternative view if child throws during self rehydration cycle', (done) => {
        const elm = createElement('x-boundary-child-self-rehydrate-throw', {
            is: XBoundaryChildSelfRehydrateThrow,
        });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('x-child-self-rehydrate-throw');
        child.incrementCounter();

        // Using a setTimeout instead of a Promise here because it takes multiple microtasks for the engine to render
        // the alternative view
        setTimeout(() => {
            const alternativeView = elm.shadowRoot.querySelector('.self-rehydrate-alternative');

            expect(alternativeView.textContent).toEqual('self rehydrate alternative view');
            expect(elm.shadowRoot.querySelector('x-child-self-rehydrate-throw')).toBe(null);

            done();
        });
    });

    it('should fail to unmount alternative offender when root element is not a boundary', () => {
        const elm = createElement('x-boundary-alternative-view-throw', {
            is: XBoundaryAlternativeViewThrow,
        });
        document.body.appendChild(elm);

        return Promise.resolve().then(() => {
            // ensure offender still exists since boundary failed to recover
            expect(
                elm.shadowRoot
                    .querySelector('x-alt-child-boundary-view-throw')
                    .shadowRoot.querySelector('x-post-error-child-view')
            ).not.toBe(null);
        });
    });
});

describe('error boundary during initial component construction', () => {
    function testStub(
        testcase,
        hostSelector,
        hostClass,
        offendingChildSelector,
        expectedErrorMessage
    ) {
        it(`should invoke parent errorCallback ${testcase}`, () => {
            const parent = createElement(hostSelector, { is: hostClass });
            document.body.appendChild(parent);
            expect(parent.errorCallbackCalled).toBe(true);
            expect(parent.error.message).toBe(expectedErrorMessage);
            // ensure offender has been unmounted
            expect(parent.querySelector(offendingChildSelector)).toBe(null);
        });
    }
    testStub(
        'when child throws in constructor',
        'x-child-constructor-throw-during-init',
        XChildConstructorThrowDuringInit,
        'x-child-constructor-throw',
        'child-constructor-throw: triggered error'
    );
    testStub(
        'when child throws in render',
        'x-child-render-throw-during-init',
        XChildRenderThrowDuringInit,
        'x-child-render-throw',
        'Child threw an error during rendering'
    );
    testStub(
        'when child throws in renderedCallback',
        'x-child-rendered-throw-during-init',
        XChildRenderedThrowDuringInit,
        'x-child-rendered-throw',
        'Child threw in renderedCallback'
    );
    testStub(
        'when child throws in connectedCallback',
        'x-child-connected-throw-during-init',
        XChildConnectedThrowDuringInit,
        'x-child-connected-throw',
        'Child threw in connectedCallback'
    );
});

// TODO [#3262]: when an error is thrown from errorCallback itself, behavior is unpredictable
// The below tests confirm existing functionality
describe('error thrown in errorCallback', () => {
    function testStub(testcase, hostSelector, hostClass) {
        it(`parent errorCallback throws ${testcase}`, () => {
            const elm = createElement(hostSelector, { is: hostClass });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrowCallbackReactionError(/error in the parent error callback/);
        });
    }

    testStub(
        'when child throws in connectedCallback',
        'x-parent-throws-child-connected-throws',
        XParentThrowsChildConnectedThrows
    );
    testStub(
        'when child throws in constructor',
        'x-parent-throws-child-constructor-throws',
        XParentThrowsChildConstructorThrows
    );
    testStub(
        'when child throws in render',
        'x-parent-throws-child-render-throws',
        XParentThrowsChildRenderThrows
    );
    testStub(
        'when child throws in renderedCallback',
        'x-parent-throws-child-rendered-throws',
        XParentThrowsChildRenderedThrows
    );
});

describe('errorCallback error caught by another errorCallback', () => {
    function testStub(testcase, hostSelector, hostClass) {
        it(`grandparent errorCallback throws, parent errorCallback throws ${testcase}`, () => {
            const elm = createElement(hostSelector, { is: hostClass });
            expect(() => {
                document.body.appendChild(elm);
            }).toThrowCallbackReactionError(/error in the grandparent error callback/);
        });
    }

    testStub(
        'when child throws in connectedCallback',
        'x-grandparent-throws-child-connected-throws',
        XGrandparentThrowsChildConnectedThrows
    );
    testStub(
        'when child throws in constructor',
        'x-grandparent-throws-child-constructor-throws',
        XGrandparentThrowsChildConstructorThrows
    );
    testStub(
        'when child throws in render',
        'x-grandparent-throws-child-render-throws',
        XGrandparentThrowsChildRenderThrows
    );
    testStub(
        'when child throws in renderedCallback',
        'x-grandparent-throws-child-rendered-throws',
        XGrandparentThrowsChildRenderedThrows
    );
});

// These tests are important because certain code paths are only hit when errorCallback throws an error
// after a value mutation. this causes flushRehydrationQueue to be called, which has a try/catch for this error.
describe('errorCallback throws after value mutation', () => {
    let originalOnError;
    let caughtError;

    // Depending on whether native custom elements lifecycle is enabled or not, this may be an unhandled error or an
    // unhandled rejection
    const onError = (e) => {
        e.preventDefault(); // Avoids logging to the console
        caughtError = e;
    };

    const onRejection = (e) => {
        // Avoids logging the error to the console, except in Firefox sadly https://bugzilla.mozilla.org/1642147
        e.preventDefault();
        caughtError = e.reason;
    };

    beforeEach(() => {
        // Overriding window.onerror disables Jasmine's global error handler, so we can listen for errors
        // ourselves. There doesn't seem to be a better way to disable Jasmine's behavior here.
        // https://github.com/jasmine/jasmine/pull/1860
        originalOnError = window.onerror;
        // Dummy onError because Jasmine tries to call it in case of a rejection:
        // https://github.com/jasmine/jasmine/blob/169a2a8/src/core/GlobalErrors.js#L104-L106
        window.onerror = () => {};
        caughtError = undefined;
        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onRejection);
    });

    afterEach(() => {
        window.removeEventListener('error', onError);
        window.removeEventListener('unhandledrejection', onRejection);
        window.onerror = originalOnError;
    });

    function testStub(testcase, hostSelector, hostClass, expectAfterThrowingChildToExist) {
        it(`parent errorCallback throws after value mutation ${testcase}`, () => {
            const throwElm = createElement(hostSelector, { is: hostClass });
            const noThrowElm = createElement('x-no-throw-on-mutate', { is: XNoThrowOnMutate });
            document.body.appendChild(throwElm);
            document.body.appendChild(noThrowElm);
            return (
                Promise.resolve()
                    .then(() => {
                        throwElm.show = true;
                        noThrowElm.show = true;
                    })
                    // Need to wait a few ticks so flushRehydrationQueue can finish
                    .then(() => new Promise((resolve) => setTimeout(resolve)))
                    .then(() => new Promise((resolve) => setTimeout(resolve)))
                    .then(() => {
                        // error is thrown by parent's errorCallback
                        expect(caughtError).not.toBeUndefined();
                        expect(caughtError.message).toMatch(
                            /error in the parent error callback after value mutation/
                        );
                        // child after the throwing child is not rendered
                        // TODO [#3261]: strange observable difference between native vs synthetic lifecycle
                        const afterThrowingChild =
                            throwElm.shadowRoot.querySelector('x-after-throwing-child');
                        if (expectAfterThrowingChildToExist) {
                            expect(afterThrowingChild).not.toBeNull();
                        } else {
                            expect(afterThrowingChild).toBeNull();
                        }
                        // An unrelated element rendered after the throwing parent still renders. I.e. we didn't
                        // give up rendering entirely just because one element threw in errorCallback.
                        expect(noThrowElm.shadowRoot.querySelector('div').textContent).toEqual(
                            'shown'
                        );
                    })
            );
        });
    }

    testStub(
        'when child throws in connectedCallback',
        'x-parent-throws-on-mutate-child-connected-throws',
        XParentThrowsOnMutateChildConnectedThrows,
        nativeCustomElementLifecycleEnabled
    );
    testStub(
        'when child throws in constructor',
        'x-parent-throws-on-mutate-child-constructor-throws',
        XParentThrowsOnMutateChildConstructorThrows,
        false
    );
    testStub(
        'when child throws in render',
        'x-parent-throws-on-mutate-child-render-throws',
        XParentThrowsOnMutateChildRenderThrows,
        false
    );
    testStub(
        'when child throws in renderedCallback',
        'x-parent-throws-on-mutate-child-rendered-throws',
        XParentThrowsOnMutateChildRenderedThrows,
        nativeCustomElementLifecycleEnabled
    );
});
