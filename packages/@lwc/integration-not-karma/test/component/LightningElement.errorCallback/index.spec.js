import { createElement } from 'lwc';
import XBoundaryChildConstructorThrow from 'c/boundaryChildConstructorThrow';
import XBoundaryChildConnectedThrow from 'c/boundaryChildConnectedThrow';
import XBoundaryChildRenderThrow from 'c/boundaryChildRenderThrow';
import XBoundaryChildRenderedThrow from 'c/boundaryChildRenderedThrow';
import XBoundaryChildSlotThrow from 'c/boundaryChildSlotThrow';
import XNestedBoundaryChildThrow from 'c/nestedBoundaryChildThrow';
import XBoundaryChildSelfRehydrateThrow from 'c/boundaryChildSelfRehydrateThrow';
import XBoundaryAlternativeViewThrow from 'c/boundaryAlternativeViewThrow';
import XBoundaryRenderedThrowFrozen from 'c/boundaryChildRenderedThrowFrozen';

import XChildConstructorThrowDuringInit from 'c/childConstructorThrowDuringInit';
import XChildRenderThrowDuringInit from 'c/childRenderThrowDuringInit';
import XChildRenderedThrowDuringInit from 'c/childRenderedThrowDuringInit';
import XChildConnectedThrowDuringInit from 'c/childConnectedThrowDuringInit';

import XParentThrowsChildConnectedThrows from 'c/parentThrowsChildConnectedThrows';
import XParentThrowsChildConstructorThrows from 'c/parentThrowsChildConstructorThrows';
import XParentThrowsChildRenderThrows from 'c/parentThrowsChildRenderThrows';
import XParentThrowsChildRenderedThrows from 'c/parentThrowsChildRenderedThrows';

import XGrandparentThrowsChildConnectedThrows from 'c/grandparentThrowsChildConnectedThrows';
import XGrandparentThrowsChildConstructorThrows from 'c/grandparentThrowsChildConstructorThrows';
import XGrandparentThrowsChildRenderThrows from 'c/grandparentThrowsChildRenderThrows';
import XGrandparentThrowsChildRenderedThrows from 'c/grandparentThrowsChildRenderedThrows';

import XParentThrowsOnMutateChildConstructorThrows from 'c/parentThrowsOnMutateChildConstructorThrows';
import XParentThrowsOnMutateChildRenderThrows from 'c/parentThrowsOnMutateChildRenderThrows';
import XParentThrowsOnMutateChildRenderedThrows from 'c/parentThrowsOnMutateChildRenderedThrows';
import XParentThrowsOnMutateChildConnectedThrows from 'c/parentThrowsOnMutateChildConnectedThrows';

import XNoThrowOnMutate from 'c/noThrowOnMutate';
import { catchUnhandledRejectionsAndErrors } from '../../../helpers/utils.js';

describe('error boundary', () => {
    it('should propagate frozen error to errorCallback()', async () => {
        const elm = createElement('c-boundary-rendered-throw-frozen', {
            is: XBoundaryRenderedThrowFrozen,
        });
        document.body.appendChild(elm);

        await Promise.resolve();
        expect(elm.getErrorMessage()).toEqual('Child threw frozen error in renderedCallback()');
    });

    it('should not add web component stack trace to frozen error', async () => {
        const elm = createElement('c-boundary-rendered-throw-frozen', {
            is: XBoundaryRenderedThrowFrozen,
        });
        document.body.appendChild(elm);

        await Promise.resolve();
        expect(elm.getErrorWCStack()).toBeUndefined();
    });

    it('should render alternative view if child throws in renderedCallback()', async () => {
        const elm = createElement('c-boundary-child-rendered-throw', {
            is: XBoundaryChildRenderedThrow,
        });
        document.body.appendChild(elm);

        await Promise.resolve();
        const alternativeView = elm.shadowRoot.querySelector('.rendered-callback-alternative');
        expect(alternativeView.textContent).toEqual('renderedCallback alternative view');
        expect(elm.shadowRoot.querySelector('c-child-rendered-throw')).toBe(null);
    });

    it('should render alternative view if child throws in render()', async () => {
        const elm = createElement('c-boundary-child-render-throw', {
            is: XBoundaryChildRenderThrow,
        });
        document.body.appendChild(elm);

        await Promise.resolve();
        const alternativeView = elm.shadowRoot.querySelector('.render-alternative');
        expect(alternativeView.textContent).toEqual('render alternative view');
        expect(elm.shadowRoot.querySelector('c-child-render-throw')).toBe(null);
    });

    it('should render alternative view if child throws in constructor()', async () => {
        const elm = createElement('c-boundary-child-constructor-throw', {
            is: XBoundaryChildConstructorThrow,
        });
        document.body.appendChild(elm);

        await Promise.resolve();
        const alternativeView = elm.shadowRoot.querySelector('.constructor-alternative');
        expect(alternativeView.textContent).toEqual('constructor alternative view');
        expect(elm.shadowRoot.querySelector('c-child-constructor-throw')).toBe(null);
        expect(elm.shadowRoot.querySelector('c-child-constructor-wrapper')).toBe(null);
    });

    it('should render alternative view if child throws in connectedCallback()', async () => {
        const elm = createElement('c-boundary-child-connected-throw', {
            is: XBoundaryChildConnectedThrow,
        });
        document.body.appendChild(elm);

        await Promise.resolve();
        const alternativeView = elm.shadowRoot.querySelector('.connected-callback-alternative');
        expect(alternativeView.textContent).toEqual('connectedCallback alternative view');
        expect(elm.shadowRoot.querySelector('c-child-connected-throw')).toBe(null);
    });

    it('should render alternative view if child slot throws in render()', async () => {
        const elm = createElement('c-boundary-child-slot-throw', { is: XBoundaryChildSlotThrow });
        document.body.appendChild(elm);

        await Promise.resolve();
        const alternativeView = elm.shadowRoot.querySelector('.slot-alternative');
        expect(alternativeView.textContent).toEqual('slot alternative view');
        expect(elm.shadowRoot.querySelector('c-child-slot-host')).toBe(null);
    });

    it('should render alternative view if nested child throws in render()', async () => {
        const elm = createElement('c-nested-boundary-child-throw', {
            is: XNestedBoundaryChildThrow,
        });
        document.body.appendChild(elm);

        await Promise.resolve();
        const alternativeView = elm.shadowRoot.querySelector('.boundary-alt-view');
        expect(alternativeView.textContent).toEqual('alternative view');
        expect(elm.shadowRoot.querySelector('c-nested-grand-child-throw')).toBe(null);
    });

    it('should render alternative view if child throws during self rehydration cycle', async () => {
        const elm = createElement('c-boundary-child-self-rehydrate-throw', {
            is: XBoundaryChildSelfRehydrateThrow,
        });
        document.body.appendChild(elm);

        const child = elm.shadowRoot.querySelector('c-child-self-rehydrate-throw');
        child.incrementCounter();

        // Using a setTimeout instead of a Promise here because it takes multiple microtasks for the engine to render
        // the alternative view
        await new Promise(setTimeout);

        const alternativeView = elm.shadowRoot.querySelector('.self-rehydrate-alternative');

        expect(alternativeView.textContent).toEqual('self rehydrate alternative view');
        expect(elm.shadowRoot.querySelector('c-child-self-rehydrate-throw')).toBe(null);
    });

    it('should fail to unmount alternative offender when root element is not a boundary', async () => {
        const elm = createElement('c-boundary-alternative-view-throw', {
            is: XBoundaryAlternativeViewThrow,
        });
        document.body.appendChild(elm);

        await Promise.resolve();
        // ensure offender still exists since boundary failed to recover
        expect(
            elm.shadowRoot
                .querySelector('c-alt-child-boundary-view-throw')
                .shadowRoot.querySelector('c-post-error-child-view')
        ).not.toBe(null);
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
        'c-child-constructor-throw-during-init',
        XChildConstructorThrowDuringInit,
        'c-child-constructor-throw',
        'child-constructor-throw: triggered error'
    );
    testStub(
        'when child throws in render',
        'c-child-render-throw-during-init',
        XChildRenderThrowDuringInit,
        'c-child-render-throw',
        'Child threw an error during rendering'
    );
    testStub(
        'when child throws in renderedCallback',
        'c-child-rendered-throw-during-init',
        XChildRenderedThrowDuringInit,
        'c-child-rendered-throw',
        'Child threw in renderedCallback'
    );
    testStub(
        'when child throws in connectedCallback',
        'c-child-connected-throw-during-init',
        XChildConnectedThrowDuringInit,
        'c-child-connected-throw',
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
        'c-parent-throws-child-connected-throws',
        XParentThrowsChildConnectedThrows
    );
    testStub(
        'when child throws in constructor',
        'c-parent-throws-child-constructor-throws',
        XParentThrowsChildConstructorThrows
    );
    testStub(
        'when child throws in render',
        'c-parent-throws-child-render-throws',
        XParentThrowsChildRenderThrows
    );
    testStub(
        'when child throws in renderedCallback',
        'c-parent-throws-child-rendered-throws',
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
        'c-grandparent-throws-child-connected-throws',
        XGrandparentThrowsChildConnectedThrows
    );
    testStub(
        'when child throws in constructor',
        'c-grandparent-throws-child-constructor-throws',
        XGrandparentThrowsChildConstructorThrows
    );
    testStub(
        'when child throws in render',
        'c-grandparent-throws-child-render-throws',
        XGrandparentThrowsChildRenderThrows
    );
    testStub(
        'when child throws in renderedCallback',
        'c-grandparent-throws-child-rendered-throws',
        XGrandparentThrowsChildRenderedThrows
    );
});

// These tests are important because certain code paths are only hit when errorCallback throws an error
// after a value mutation. this causes flushRehydrationQueue to be called, which has a try/catch for this error.
describe('errorCallback throws after value mutation', () => {
    let caughtError;

    // Depending on whether native custom elements lifecycle is enabled or not, this may be an unhandled error or an
    // unhandled rejection. This utility captures both.
    catchUnhandledRejectionsAndErrors((error) => {
        caughtError = error;
    });

    afterEach(() => {
        caughtError = undefined;
    });

    function testStub(testcase, hostSelector, hostClass, expectAfterThrowingChildToExist) {
        it(`parent errorCallback throws after value mutation ${testcase}`, async () => {
            const throwElm = createElement(hostSelector, { is: hostClass });
            const noThrowElm = createElement('c-no-throw-on-mutate', { is: XNoThrowOnMutate });
            document.body.appendChild(throwElm);
            document.body.appendChild(noThrowElm);
            await Promise.resolve();
            throwElm.show = true;
            noThrowElm.show = true;
            await new Promise((resolve) => setTimeout(resolve));
            await new Promise((resolve_1) => setTimeout(resolve_1));
            // error is thrown by parent's errorCallback
            expect(caughtError).not.toBeUndefined();
            expect(caughtError.message).toMatch(
                /error in the parent error callback after value mutation/
            );
            // child after the throwing child is not rendered
            // TODO [#3261]: strange observable difference between native vs synthetic lifecycle
            const afterThrowingChild = throwElm.shadowRoot.querySelector('c-after-throwing-child');
            if (expectAfterThrowingChildToExist) {
                expect(afterThrowingChild).not.toBeNull();
            } else {
                expect(afterThrowingChild).toBeNull();
            }
            // An unrelated element rendered after the throwing parent still renders. I.e. we didn't
            // give up rendering entirely just because one element threw in errorCallback.
            expect(noThrowElm.shadowRoot.querySelector('div').textContent).toEqual('shown');
        });
    }

    testStub(
        'when child throws in connectedCallback',
        'c-parent-throws-on-mutate-child-connected-throws',
        XParentThrowsOnMutateChildConnectedThrows,
        !lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
    );
    testStub(
        'when child throws in constructor',
        'c-parent-throws-on-mutate-child-constructor-throws',
        XParentThrowsOnMutateChildConstructorThrows,
        false
    );
    testStub(
        'when child throws in render',
        'c-parent-throws-on-mutate-child-render-throws',
        XParentThrowsOnMutateChildRenderThrows,
        false
    );
    testStub(
        'when child throws in renderedCallback',
        'c-parent-throws-on-mutate-child-rendered-throws',
        XParentThrowsOnMutateChildRenderedThrows,
        !lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
    );
});
