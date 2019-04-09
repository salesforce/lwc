import { createElement } from 'test-utils';
import XErrorBoundary from 'x/errorBoundary';

// Wait for a macrotask because the test has to wait for a nested rehydration(async) to complete.
// tl;dr
// The tests are setup in a way where, each test component is enabled by changing a
// tracked property on the container('x-error-boundary-suite'). This triggers an rehydration.
// Next, there is an intermediate component that has errorCallback() to handle errors in the nested
// child's life cycle. The intermediate component triggers a self rehydration by changing its state
// in the errorCallback()
function waitForNestedRehydration() {
    return new Promise(resolve => {
        setTimeout(resolve);
    });
}

describe('error boundary integration', () => {
    let elm;
    let shadowRoot;
    beforeEach(() => {
        elm = createElement('x-error-boundary-suite', { is: XErrorBoundary });
        document.body.appendChild(elm);
        shadowRoot = elm.shadowRoot;
    });

    it('should render alternative view if child throws in renderedCallback()', () => {
        elm.flipFlag('boundary-child-rendered-throw');
        return waitForNestedRehydration().then(() => {
            const innerShadowRoot = shadowRoot.querySelector('x-boundary-child-rendered-throw')
                .shadowRoot;
            const altenativeView = innerShadowRoot.querySelector('.rendered-calback-altenative');
            expect(altenativeView.textContent).toEqual('renderedCallback alternative view');

            // ensure offender has been unmounted
            expect(innerShadowRoot.querySelector('x-child-rendered-throw')).toBe(null);
        });
    });

    it('should render alternative view if child throws in render()', () => {
        elm.flipFlag('boundary-child-render-throw');
        return waitForNestedRehydration().then(() => {
            const innerShadowRoot = shadowRoot.querySelector('x-boundary-child-render-throw')
                .shadowRoot;
            const altenativeView = innerShadowRoot.querySelector('.render-altenative');
            expect(altenativeView.textContent).toEqual('render alternative view');

            // ensure offender has been unmounted
            expect(innerShadowRoot.querySelector('x-child-render-throw')).toBe(null);
        });
    });

    it('should render alternative view if child throws in constructor()', () => {
        elm.flipFlag('boundary-child-constructor-throw');
        return waitForNestedRehydration().then(() => {
            const innerShadowRoot = shadowRoot.querySelector('x-boundary-child-constructor-throw')
                .shadowRoot;
            const altenativeView = innerShadowRoot.querySelector('.constructor-altenative');
            expect(altenativeView.textContent).toEqual('constructor alternative view');

            // ensure offender has been unmounted
            expect(innerShadowRoot.querySelector('x-child-constructor-throw')).toBe(null);
            expect(innerShadowRoot.querySelector('x-child-constructor-wrapper')).toBe(null);
        });
    });

    it('should render alternative view if child throws in connectedCallback()', () => {
        elm.flipFlag('boundary-child-connected-throw');
        return waitForNestedRehydration().then(() => {
            const innerShadowRoot = shadowRoot.querySelector('x-boundary-child-connected-throw')
                .shadowRoot;
            const altenativeView = innerShadowRoot.querySelector('.connected-callback-altenative');
            expect(altenativeView.textContent).toEqual('connectedCallback alternative view');

            // ensure offender has been unmounted
            expect(innerShadowRoot.querySelector('x-child-connected-throw')).toBe(null);
        });
    });

    it('should render alternative view if child slot throws in render()', () => {
        elm.flipFlag('boundary-child-slot-throw');
        return waitForNestedRehydration().then(() => {
            const innerShadowRoot = shadowRoot.querySelector('x-boundary-child-slot-throw')
                .shadowRoot;
            const altenativeView = innerShadowRoot.querySelector('.slot-altenative');
            expect(altenativeView.textContent).toEqual('slot alternative view');

            // ensure offender has been unmounted
            expect(innerShadowRoot.querySelector('x-child-slot-host')).toBe(null);
        });
    });

    it('should render alternative view if child throws during self rehydration cycle', done => {
        elm.flipFlag('boundary-child-self-rehydrate-throw');
        return Promise.resolve().then(() => {
            const innerShadowRoot = shadowRoot.querySelector(
                'x-boundary-child-self-rehydrate-throw'
            ).shadowRoot;
            const deepNestedHost = innerShadowRoot.querySelector('x-child-self-rehydrate-throw');
            deepNestedHost.incrementCounter();
            waitForNestedRehydration().then(() => {
                const altenativeView = innerShadowRoot.querySelector('.self-rehydrate-altenative');
                expect(altenativeView.textContent).toEqual('self rehydrate alternative view');

                // ensure offender has been unmounted
                expect(innerShadowRoot.querySelector('x-child-self-rehydrate-throw')).toBe(null);
                done();
            });
        });
    });

    xit('should render parent boundary`s alternative view when child boundary to render its alternative view', () => {
        elm.flipFlag('nested-boundary-child-alt-view-throw');
        return waitForNestedRehydration().then(() => {
            const innerShadowRoot = shadowRoot.querySelector(
                'x-nested-boundary-child-alt-view-throw'
            ).shadowRoot;
            const altenativeView = innerShadowRoot.querySelector('.boundary-alt-view');
            expect(altenativeView.textContent).toEqual('Host Boundary Alternative View');

            // ensure offender has been unmounted
            expect(innerShadowRoot.querySelector('x-nested-child-boundary-view-throw')).toBe(null);
        });
    });

    it('should fail to unmount alternatvie offender when root element is not a boundary', () => {
        elm.flipFlag('boundary-alternative-view-throw');
        return waitForNestedRehydration().then(() => {
            const innerShadowRoot = shadowRoot.querySelector('x-boundary-alternative-view-throw')
                .shadowRoot;

            // ensure offender still exists since boundary failed to recover
            expect(
                innerShadowRoot
                    .querySelector('x-alt-child-boundary-view-throw')
                    .shadowRoot.querySelector('x-post-error-child-view')
            ).not.toBe(null);
        });
    });
});
