import { Element } from "../html-element";
import { createElement } from "../upgrade";
import { querySelector, querySelectorAll } from "../dom";

function createBoundaryComponent(elementsToRender) {
    function html($api, $cmp) {
        if ($cmp.getError()) {
            return [];
        } else {
            return elementsToRender.map((config) => {
                return $api.c(config.name, config.ctor, config.props || {});
            });
        }
    }
    class Boundary extends Element {
        getError() {
            return this.error;
        }

        errorCallback(error) {
            this.error = error.message;
        }

        render() {
            return html;
        }
    }
    Boundary.publicMethods = ['getError'];
    Boundary.track = { error: 1 };
    return Boundary;
}

describe('error boundary component', () => {

    describe('errors occured inside boundary wrapped child`s lifecycle methods', () => {

        describe('constructor', () => {
            it('should call errorCallback when boundary child throws inside constructor', () => {
                class BoundaryChild extends Element {
                    constructor() {
                        super();
                        throw new Error("Child Constructor Throw");
                    }
                }
                const Boundary = createBoundaryComponent([{
                    name: 'x-child',
                    ctor: BoundaryChild
                }]);
                const boundaryElm = createElement('x-boundary', {is: Boundary});
                document.body.appendChild(boundaryElm);

                expect(boundaryElm.getError()).toBe("Child Constructor Throw");

            }),

            it('should not affect error boundary siblings when boundary child throws inside constructor', () => {
                class BoundaryChild extends Element {
                    constructor() {
                        super();
                        throw new Error("Child Constructor Throw");
                    }
                }
                class BoundarySibling extends Element {}
                const Boundary = createBoundaryComponent([{
                    name: 'x-child',
                    ctor: BoundaryChild
                }]);
                function html($api, $cmp) {
                    return [
                        $api.c('x-boundary', Boundary, {}),
                        $api.c('x-boundary-sibling', BoundarySibling, {}),
                    ];
                }
                class BoundryHost extends Element {
                    render() {
                        return html;
                    }
                }
                const boundaryHostElm = createElement('x-boundary', {is: BoundryHost});

                document.body.appendChild(boundaryHostElm);
                expect(querySelectorAll.call(boundaryHostElm, 'x-boundary-sibling').length).toBe(1);
            }),

            it('should unmount enitre subtree up to boundary component if child throws inside constructor', () => {
                class SecondLevelChild extends Element {}
                function html($api, $cmp) {
                    return [ $api.c('x-second-level-child', SecondLevelChild, {})];
                }
                class FirstLevelChild extends Element {
                    constructor() {
                        super();
                        throw new Error("Child Constructor Throw");
                    }

                    render() {
                        return html;
                    }
                }
                const Boundary = createBoundaryComponent([{
                    name: 'x-first-level-child',
                    ctor: FirstLevelChild
                }]);

                const elm = createElement('x-boundary', { is: Boundary });
                document.body.appendChild(elm);

                expect(querySelector.call(elm, 'x-second-level-child')).toBeNull();
                expect(querySelector.call(elm, 'x-first-level-child')).toBeNull();
            }),

            it('should throw if error occurs in error boundary constructor', () => {
                class FirstLevelChild extends Element {}
                class FirstLevelChildSibling extends Element {}
                function html($api, $cmp) {
                    return [
                        $api.c('x-first-level-child-sibling', FirstLevelChildSibling, {}),
                        $api.c('x-first-level-child', FirstLevelChild, {})
                    ];
                }
                class Boundary extends Element {
                    constructor() {
                        super();
                        throw new Error();
                    }

                    render() {
                        return html;
                    }
                }
                expect( () => {
                    const elm = createElement('x-boundary', { is: Boundary });
                    document.body.appendChild(elm);
                }).toThrow();
                expect(document.body.querySelector('x-first-level-child')).toBeNull();
                expect(document.body.querySelector('x-first-level-child-sibling')).toBeNull();
            });
        }),

        describe('render', () => {
            it('should call errorCallback when boundary child throws inside render', () => {
                class BoundaryChild extends Element {
                    render() {
                        throw new Error("Child Render Throw");
                    }
                }
                const Boundary = createBoundaryComponent([{
                    name: 'x-child',
                    ctor: BoundaryChild
                }]);
                const boundaryElm = createElement('x-boundary', {is: Boundary});
                document.body.appendChild(boundaryElm);

                expect(boundaryElm.getError()).toBe("Child Render Throw");
            }),

            it('should throw when error boundary throws inside render method', () => {
                class Boundary extends Element {
                    getError() {
                        return this.error;
                    }
                    errorCallback(error) {
                        this.error = error.message;
                    }
                    render() {
                        throw new Error('Boundary Render Throw');
                    }
                }
                Boundary.publicMethods = ['getError'];
                Boundary.track = { error: 1 };

                const boundaryElm = createElement('x-boundary', {is: Boundary});

                expect( () => {
                    document.body.appendChild(boundaryElm);
                }).toThrow();
            }),

            it('should not affect error boundary siblings when boundary child throws inside render', () => {
                class BoundaryChild extends Element {
                    render() {
                        throw new Error("Child Constructor Throw");
                    }
                }
                class BoundarySibling extends Element {}
                const Boundary = createBoundaryComponent([{
                    name: 'x-child',
                    ctor: BoundaryChild
                }]);
                function html($api, $cmp) {
                    return [
                        $api.c('x-boundary', Boundary, {}),
                        $api.c('x-boundary-sibling', BoundarySibling, {}),
                    ];
                }
                class BoundryHost extends Element {
                    render() {
                        return html;
                    }
                }
                const boundaryHostElm = createElement('x-boundary', {is: BoundryHost});
                document.body.appendChild(boundaryHostElm);

                expect(querySelectorAll.call(boundaryHostElm, 'x-boundary-sibling').length).toBe(1);
            }),

            it('should unmount child and its subtree if boundary child throws inside render', () => {
                class SecondLevelChild extends Element {
                    render() {
                        throw new Error("Child Render Throw");
                    }
                }
                function html($api, $cmp) {
                    return [ $api.c('x-second-level-child', SecondLevelChild, {})];
                }
                class FirstLevelChild extends Element {
                    render() {
                        return html;
                    }
                }
                const Boundary = createBoundaryComponent([{
                    name: 'x-first-level-child',
                    ctor: FirstLevelChild
                }]);

                const elm = createElement('x-boundary', { is: Boundary });
                document.body.appendChild(elm);

                expect(querySelector.call(elm, 'x-first-level-child')).toBeNull();
                expect(querySelector.call(elm, 'x-second-level-child')).toBeNull();
            }),

            it ('should call errorCallback if slot throws an error inside render', () => {
                class SlotCmp extends Element {
                    render() {
                        throw Error('Slot cmp throws in render method');
                    }
                }
                function html1($api, $cmp, $slotset) {
                    return $slotset.x;
                }
                class ChildWithSlot extends Element {
                    render() {
                        return html1;
                    }
                }
                function html2($api, $cmp) {
                    // TODO: There is no way to set 'slot' value onto the template to be matched agains slotset key.
                    // Not setting it causes the following warning:
                    // - Ignoring unknown provided slot name "x" in [object:vm ChildWithSlot (7)]. This is probably a typo on the slot attribute.
                    return [ $api.c('x-child-with-slot', ChildWithSlot, { slotset: { x: [ $api.c('x-slot-cmp', SlotCmp, {})]}}) ];
                }
                class BoundaryWithSlot extends Element {
                    getError() {
                        return this.error;
                    }
                    errorCallback(error) {
                        this.error = error.message;
                    }
                    render() {
                        return html2;
                    }
                }
                BoundaryWithSlot.publicMethods = ['getError'];
                BoundaryWithSlot.track = { error: 1 };

                const boundaryElm = createElement('x-boundary-with-slot', { is: BoundaryWithSlot });
                document.body.appendChild(boundaryElm);

                expect(boundaryElm.getError()).toBe('Slot cmp throws in render method');
            });
        }),

        describe('renderedCallback', () => {
            it('should call errorCallback when boundary child throws inside renderedCallback', () => {
                class BoundaryChild extends Element {
                    renderedCallback() {
                        throw new Error("Child RenderedCallback Throw");
                    }
                }
                const Boundary = createBoundaryComponent([{
                    name: 'x-child',
                    ctor: BoundaryChild
                }]);
                const boundaryElm = createElement('x-boundary', {is: Boundary});
                document.body.appendChild(boundaryElm);

                expect(boundaryElm.getError()).toBe("Child RenderedCallback Throw");
            }),

            it('should throw an error when error boundary throws inside renderedCallback', () => {
                class Boundary extends Element {
                    getError() {
                        return this.error;
                    }
                    errorCallback(error, info) {
                        this.error = error.message;
                    }
                    renderedCallback() {
                        throw new Error('Boundary RenderedCallback Throw');
                    }
                }
                Boundary.publicMethods = ['getError'];
                Boundary.track = { error: 1 };

                const boundaryElm = createElement('x-boundary', {is: Boundary});

                expect( () => {
                    document.body.appendChild(boundaryElm);
                }).toThrow();
            }),

            it('should unomunt child error boundary component if it throws inside errorCallback', () => {
                class ChildBoundaryContent extends Element {
                    renderedCallback() {
                        throw new Error("Child RenderedCallback Throw");
                    }
                }
                function html($api, $cmp) {
                    return [$api.c('child-boundary-content', ChildBoundaryContent, {})];
                }
                class ChildErrorBoundary extends Element {
                    getError() {
                        return this.error;
                    }
                    errorCallback(error, info) {
                        throw new Error('Child Boundary ErrorCallback Throw');
                    }
                    render() {
                        return html;
                    }
                }
                ChildErrorBoundary.publicMethods = ['getError'];
                ChildErrorBoundary.track = { error: 1 };

                const HostErrorBoundary = createBoundaryComponent([{
                    name: 'child-error-boundary',
                    ctor: ChildErrorBoundary
                }]);

                const hostBoundaryElm = createElement('host-boundary', {is: HostErrorBoundary});
                document.body.appendChild(hostBoundaryElm);

                expect(hostBoundaryElm.getError()).toBe('Child Boundary ErrorCallback Throw');
                expect(querySelectorAll.call(hostBoundaryElm, 'child-error-boundary').length).toBe(0);
            });

            it('should unmount error boundary child if it throws inside renderedCallback', () => {
                class ChildErrorBoundary extends Element {
                    getError() {
                        return this.error;
                    }
                    errorCallback(error, info) {
                        this.error = error.message;
                    }
                    renderedCallback() {
                        throw new Error('Child Boundary RenderedCallback Throw');
                    }
                }
                ChildErrorBoundary.publicMethods = ['getError'];
                ChildErrorBoundary.track = { error: 1 };

                const HostErrorBoundary  = createBoundaryComponent([{
                    name: 'child-error-boundary',
                    ctor: ChildErrorBoundary
                }]);

                const hostBoundaryElm = createElement('host-boundary', {is: HostErrorBoundary});
                document.body.appendChild(hostBoundaryElm);

                expect(hostBoundaryElm.getError()).toBe('Child Boundary RenderedCallback Throw');
                expect(querySelectorAll.call(hostBoundaryElm, 'child-error-boundary').length).toBe(0);
            }),

            it('should invoke parent boundary if child`s immediate boundary fails inside renderedCallback', () => {
                class ChildBoundaryContent extends Element {
                    renderedCallback() {
                        throw new Error("Child RenderedCallback Throw");
                    }
                }
                function html($api, $cmp) {
                    return [$api.c('child-boundary-content', ChildBoundaryContent, {})];
                }
                class ChildErrorBoundary extends Element {
                    getError() {
                        return this.error;
                    }
                    errorCallback(error, info) {
                        this.error = error.message;
                    }
                    renderedCallback() {
                        throw new Error('Child Boundary RenderedCallback Throw');
                    }
                    render() {
                        return html;
                    }
                }
                ChildErrorBoundary.publicMethods = ['getError'];
                ChildErrorBoundary.track = { error: 1 };

                const HostErrorBoundary = createBoundaryComponent([{
                    name: 'child-error-boundary',
                    ctor: ChildErrorBoundary
                }]);

                const hostBoundaryElm = createElement('host-boundary', {is: HostErrorBoundary});
                document.body.appendChild(hostBoundaryElm);

                expect(hostBoundaryElm.getError()).toBe('Child Boundary RenderedCallback Throw');
                expect(querySelectorAll.call(hostBoundaryElm, 'child-error-boundary').length).toBe(0);
                expect(querySelectorAll.call(hostBoundaryElm, 'child-boundary-content').length).toBe(0);
            }),

            it('should not affect error boundary siblings when boundary child throws inside renderedCallback', () => {
                class BoundaryChild extends Element {
                    renderedCallback() {
                        throw new Error("Child RenderedCallback Throw");
                    }
                }
                class BoundarySibling extends Element {}

                const Boundary = createBoundaryComponent([{
                    name: 'x-child',
                    ctor: BoundaryChild
                }]);
                function html($api, $cmp) {
                    return [
                        $api.c('x-boundary', Boundary, {}),
                        $api.c('x-boundary-sibling', BoundarySibling, {}),
                    ];
                }
                class BoundryHost extends Element {
                    render() {
                        return html;
                    }
                }
                const boundaryHostElm = createElement('x-boundary', {is: BoundryHost});
                document.body.appendChild(boundaryHostElm);

                expect(querySelectorAll.call(boundaryHostElm, 'x-boundary-sibling').length).toBe(1);
            }),

            it('should unmount boundary child and its subtree if child throws inside renderedCallback', () => {
                class SecondLevelChild extends Element {
                    renderedCallback() {
                        throw new Error("Child RenderedCallback Throw");
                    }
                }
                function html($api, $cmp) {
                    return [$api.c('x-second-level-child', SecondLevelChild, {})];
                }
                class FirstLevelChild extends Element {
                    render() {
                        return html;
                    }
                }
                const Boundary = createBoundaryComponent([{
                    name: 'x-first-level-child',
                    ctor: FirstLevelChild
                }]);

                const elm = createElement('x-boundary', { is: Boundary });
                document.body.appendChild(elm);

                expect(querySelector.call(elm, 'x-second-level-child')).toBeNull();
                expect(querySelector.call(elm, 'x-first-level-child')).toBeNull();
            });
        }),

        describe('connectedCallback', () => {
            it('should call errorCallback when boundary child throws inside connectedCallback', () => {
                class BoundaryChild extends Element {
                    connectedCallback() {
                        throw new Error("Child ConnectedCallback Throw");
                    }
                }
                const Boundary = createBoundaryComponent([{
                    name: 'x-child',
                    ctor: BoundaryChild
                }]);

                const boundaryElm = createElement('x-boundary', {is: Boundary});
                document.body.appendChild(boundaryElm);

                expect(boundaryElm.getError()).toBe("Child ConnectedCallback Throw");
            }),

            it('should throw an error when error boundary throws inside connectedCallback', () => {
                class Boundary extends Element {
                    getError() {
                        return this.error;
                    }
                    errorCallback(error) {
                        this.error = error.message;
                    }
                    connectedCallback() {
                        throw new Error('Boundary ConnectedCallback Throw');
                    }
                }
                Boundary.publicMethods = ['getError'];
                Boundary.track = { error: 1 };

                const boundaryElm = createElement('x-boundary', {is: Boundary});

                expect( () => {
                    document.body.appendChild(boundaryElm);
                }).toThrow();
            }),

            it('should not affect error boundary siblings when boundary child throws inside connectedCallback', () => {
                class BoundaryChild extends Element {
                    connectedCallback() {
                        throw new Error("Child ConnectedCallback Throw");
                    }
                }
                class BoundarySibling extends Element {}

                const Boundary = createBoundaryComponent([{
                    name: 'x-child',
                    ctor: BoundaryChild
                }]);
                function html($api, $cmp) {
                    return [
                        $api.c('x-boundary', Boundary, {}),
                        $api.c('x-boundary-sibling', BoundarySibling, {}),
                    ];
                }
                class BoundryHost extends Element {
                    render() {
                        return html;
                    }
                }
                const boundaryHostElm = createElement('x-boundary', {is: BoundryHost});
                document.body.appendChild(boundaryHostElm);

                expect(querySelectorAll.call(boundaryHostElm, 'x-boundary-sibling').length).toBe(1);
            }),

            it('should unmount boundary child and its subtree if boundary child throws inside connectedCallback', () => {
                class SecondLevelChild extends Element {
                    connectedCallback() {
                        throw new Error("Child ConnectedCallback Throw");
                    }
                }
                function html($api, $cmp) {
                    return [ $api.c('x-second-level-child', SecondLevelChild, {})];
                }
                class FirstLevelChild extends Element {
                    render() {
                        return html;
                    }
                }
                const Boundary = createBoundaryComponent([{
                    name: 'x-first-level-child',
                    ctor: FirstLevelChild
                }]);

                const elm = createElement('x-boundary', { is: Boundary });
                document.body.appendChild(elm);

                expect(querySelector.call(elm, 'x-second-level-child')).toBeNull();
                expect(querySelector.call(elm, 'x-first-level-child')).toBeNull();
            });
        });

        describe('error boundary failures in rendering alternative view', () => {
            it('should throw if error boundary fails to render alternative view', () => {
                class PostErrorChildOffender extends Element {
                    render() {
                        throw new Error("Post-Failure Child Content Throws in Render");
                    }
                }
                class PreErrorChildContent extends Element {
                    render() {
                        throw new Error("Pre-Failure Child Content Throws in Render");
                    }
                }
                function html($api, $cmp) {
                    if ($cmp.getError()) {
                        return [ $api.c('post-error-child-content', PostErrorChildOffender, {})];
                    } else {
                        return [ $api.c('pre-error-child-content', PreErrorChildContent, {})];
                    }
                }
                class AltViewErrorBoundary extends Element {
                    getError() {
                        return this.error;
                    }
                    errorCallback(error, info) {
                        this.error = error.message;
                    }
                    render() {
                        return html;
                    }
                }
                AltViewErrorBoundary.publicMethods = ['getError'];
                AltViewErrorBoundary.track = { error: 1 };

                const altViewElm = createElement('alt-view-boundary', { is: AltViewErrorBoundary });

                expect( () => {
                    document.body.appendChild(altViewElm);
                }).toThrowError();
            }),

            it('should rethrow error to the parent error boundary when child boundary fails to render alternative view', () => {
                class PostErrorChildOffender extends Element {
                    render() {
                        throw new Error("Post-Failure Child Content Throws in Render");
                    }
                }
                class PreErrorChildContent extends Element {
                    render() {
                        throw new Error("Pre-Failure Child Content Throws in Render");
                    }
                }
                function html($api, $cmp) {
                    if ($cmp.getError()) {
                        return [ $api.c('post-error-child-content', PostErrorChildOffender, {})];
                    } else {
                        return [ $api.c('pre-error-child-content', PreErrorChildContent, {})];
                    }
                }
                class AltViewErrorBoundary extends Element {
                    getError() {
                        return this.error;
                    }
                    errorCallback(error, info) {
                        this.error = error.message;
                    }
                    render() {
                        return html;
                    }
                }
                AltViewErrorBoundary.publicMethods = ['getError'];
                AltViewErrorBoundary.track = { error: 1 };

                const HostBoundary = createBoundaryComponent([{
                    name: 'alt-view-error-boundary',
                    ctor: AltViewErrorBoundary
                }]);

                const hostElm = createElement('host-boundary', { is: HostBoundary });
                document.body.appendChild(hostElm);

                expect(hostElm.getError()).toBe("Post-Failure Child Content Throws in Render");
                expect(querySelectorAll.call(hostElm, 'alt-view-error-boundary').length).toBe(0);
            });
        });
    });
});
