import { createElement } from 'lwc';

import XBoundaryChildConstructorThrow from 'x/boundaryChildConstructorThrow';
import XBoundaryChildConnectedThrow from 'x/boundaryChildConnectedThrow';
import XBoundaryChildRenderThrow from 'x/boundaryChildRenderThrow';
import XBoundaryChildRenderedThrow from 'x/boundaryChildRenderedThrow';
import XBoundaryChildSlotThrow from 'x/boundaryChildSlotThrow';
import XNestedBoundaryChildThrow from 'x/nestedBoundaryChildThrow';
import XBoundaryChildSelfRehydrateThrow from 'x/boundaryChildSelfRehydrateThrow';
import XBoundaryAlternativeViewThrow from 'x/boundaryAlternativeViewThrow';

import XChildConstructorThrowDuringInit from 'x/childConstructorThrowDuringInit';
import XChildRenderThrowDuringInit from 'x/childRenderThrowDuringInit';
import XChildRenderedThrowDuringInit from 'x/childRenderedThrowDuringInit';
import XChildConnectedThrowDuringInit from 'x/childConnectedThrowDuringInit';

describe('error boundary', () => {
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
