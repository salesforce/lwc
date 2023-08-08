import { createElement } from 'lwc';
import XParent from 'x/parent';
import XSlottedChild from 'x/slottedChild';
import XNestedSlotContainer from 'x/nestedSlotContainer';
import XTemplateMutations from 'x/templateMutations';

const observerConfig = { childList: true, subtree: true };

function waitForMutationObservedToBeInvoked() {
    return Promise.resolve();
}

describe('MutationObserver is synthetic shadow dom aware.', () => {
    describe('mutations do not leak shadow boundary', () => {
        let globalObserverSpy;
        let container;
        beforeEach(() => {
            globalObserverSpy = jasmine.createSpy();
            const globalObserver = new MutationObserver(globalObserverSpy);
            container = document.createElement('div');
            document.body.appendChild(container);
            // Attach to container node instead of document or body to not affect other tests
            globalObserver.observe(container, observerConfig);
        });

        it('global observer should be called 1 time, when the host element is attached to document', (done) => {
            // Prepare body for new lwc element
            const host = createElement('x-parent', { is: XParent });
            const container = document.createElement('div');
            document.body.appendChild(container);
            const callback = function (actualMutationRecords, actualObserver) {
                expect(actualObserver).toBe(containerObserver);
                expect(actualMutationRecords.length).toBe(1);
                expect(actualMutationRecords[0].target).toBe(container);
                expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('X-PARENT');
                done();
            };
            const containerObserver = new MutationObserver(callback);
            // Attach to container node instead of document or body to not affect other tests
            containerObserver.observe(container, observerConfig);
            container.appendChild(host);
        });

        it('global observer is not called when mutations occur inside shadow tree', () => {
            const host = createElement('x-parent', { is: XParent });
            container.appendChild(host);
            return waitForMutationObservedToBeInvoked()
                .then(() => {
                    // The first call will be when x-parent is appended to the container
                    globalObserverSpy.calls.reset();

                    // Mutate the shadow tree of x-parent
                    const parentDiv = host.shadowRoot.querySelector('div');
                    parentDiv.appendChild(document.createElement('p'));
                    return waitForMutationObservedToBeInvoked().then(() => {
                        expect(globalObserverSpy).not.toHaveBeenCalled();
                    });
                })
                .then(() => {
                    // Mutate the shadow tree of x-child
                    const childElm = host.shadowRoot.querySelector('x-child');
                    const childDiv = childElm.shadowRoot.querySelector('div');
                    childDiv.appendChild(document.createElement('p'));
                    return waitForMutationObservedToBeInvoked().then(() => {
                        expect(globalObserverSpy).not.toHaveBeenCalled();
                    });
                });
        });

        it('global observer is not called when mutations occur in slotted content', () => {
            const parent = createElement('x-slotted-child', { is: XSlottedChild });
            container.appendChild(parent);
            return waitForMutationObservedToBeInvoked().then(() => {
                // The first call will be when x-slotted-child is appended to the container
                globalObserverSpy.calls.reset();
                const slottedDiv = parent.shadowRoot.querySelector('div.manual');
                slottedDiv.appendChild(document.createElement('p'));
                return waitForMutationObservedToBeInvoked().then(() => {
                    expect(globalObserverSpy).not.toHaveBeenCalled();
                });
            });
        });

        it('should invoke observer on parent when slotted content is altered', () => {
            const parent = createElement('x-slotted-child', { is: XSlottedChild });
            container.appendChild(parent);
            const slottedDiv = parent.shadowRoot.querySelector('div.manual');

            // observer on parent element's shadowRoot will be notified
            // because the slot content being mutated belongs to that shadow tree
            const callback = function (actualMutationRecords, actualObserver) {
                expect(actualObserver).toBe(parentSRObserver);
                expect(actualMutationRecords.length).toBe(1);
                expect(actualMutationRecords[0].target).toBe(slottedDiv);
                expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('P');
            };
            // Start observing the parent and child shadow trees
            const parentHostSpy = jasmine.createSpy();
            new MutationObserver(parentHostSpy).observe(parent, observerConfig);
            const parentSRObserver = new MutationObserver(callback);
            parentSRObserver.observe(parent.shadowRoot, observerConfig);
            const childSRSpy = jasmine.createSpy();
            new MutationObserver(childSRSpy).observe(
                parent.shadowRoot.querySelector('x-child').shadowRoot,
                observerConfig
            );

            slottedDiv.appendChild(document.createElement('p'));
            return waitForMutationObservedToBeInvoked().then(() => {
                // observer on parent host element should not see mutation
                expect(parentHostSpy).not.toHaveBeenCalled();
                // observer on the slot receiver should not see mutation
                expect(childSRSpy).not.toHaveBeenCalled();
            });
        });

        it('should invoke observer on slot content owner', () => {
            const parent = createElement('x-nested-slot-container', { is: XNestedSlotContainer });
            container.appendChild(parent);
            const slottedDiv = parent.shadowRoot.querySelector('div.manual');

            // observer on parent element's shadowRoot will be notified
            // because the slot content being mutated belongs to that shadow tree
            const callback = function (actualMutationRecords, actualObserver) {
                expect(actualObserver).toBe(parentSRObserver);
                expect(actualMutationRecords.length).toBe(1);
                expect(actualMutationRecords[0].target).toBe(slottedDiv);
                expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('P');
            };
            // Start observing the parent and child shadow trees
            // x-nested-slot-container
            const parentSRObserver = new MutationObserver(callback);
            parentSRObserver.observe(parent.shadowRoot, observerConfig);
            // x-nested-slot
            const childSRSpy = jasmine.createSpy();
            const child = parent.shadowRoot.querySelector('x-nested-slot');
            new MutationObserver(childSRSpy).observe(child.shadowRoot, observerConfig);
            // x-child
            const grandChildSRSpy = jasmine.createSpy();
            const grandChild = child.shadowRoot.querySelector('x-child');
            new MutationObserver(grandChildSRSpy).observe(grandChild.shadowRoot, observerConfig);
            // x-child > slot
            const grandChildSlotSpy = jasmine.createSpy();
            const grandChildSlot = grandChild.shadowRoot.querySelector('slot');
            new MutationObserver(grandChildSlotSpy).observe(grandChildSlot, observerConfig);

            slottedDiv.appendChild(document.createElement('p'));
            // Skip a macrotask to allow for observers to be invoked, if any
            return waitForMutationObservedToBeInvoked().then(() => {
                // observers on the slot receiver should not see mutation
                expect(childSRSpy).not.toHaveBeenCalled();
                expect(grandChildSRSpy).not.toHaveBeenCalled();
                expect(grandChildSlotSpy).not.toHaveBeenCalled();
            });
        });

        it('parent observer not invoked when mutations occur in a nested lwc', () => {
            const parent = createElement('x-parent', { is: XParent });
            container.appendChild(parent);

            // Start observing the parent and child shadow trees
            const parentSpy = jasmine.createSpy();
            new MutationObserver(parentSpy).observe(parent.shadowRoot, observerConfig);

            const childElm = parent.shadowRoot.querySelector('x-child');
            const childDiv = childElm.shadowRoot.querySelector('div');
            childDiv.appendChild(document.createElement('p'));

            // Skip a macrotask to allow for observers to be invoked, if any
            return waitForMutationObservedToBeInvoked().then(() => {
                expect(parentSpy).not.toHaveBeenCalled();
            });
        });
    });
    describe('should handle mutations in shadow tree', () => {
        let container;
        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        if (!process.env.MIXED_SHADOW) {
            it('should invoke observer with correct MutationRecords when adding child nodes using innerHTML', (done) => {
                const parent = createElement('x-parent', { is: XParent });
                container.appendChild(parent);
                let observer;
                const parentDiv = parent.shadowRoot.querySelector('div');
                const callback = function (actualMutationRecords, actualObserver) {
                    expect(actualObserver).toBe(observer);
                    expect(actualMutationRecords.length).toBe(1);
                    expect(actualMutationRecords[0].target).toBe(parentDiv);
                    expect(actualMutationRecords[0].addedNodes.length).toBe(2);
                    expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('H3');
                    expect(actualMutationRecords[0].addedNodes[1].tagName).toBe('P');
                    done();
                };
                observer = new MutationObserver(callback);
                observer.observe(parent.shadowRoot, observerConfig);
                // Mutate the shadow tree of x-parent
                parentDiv.innerHTML = `<h3></h3><p></p>`;
            });

            it('should invoke observer with correct MutationRecords when adding child nodes using appendChild', () => {
                const parent = createElement('x-parent', { is: XParent });
                container.appendChild(parent);
                return new Promise((resolve) => {
                    let observer;
                    const parentDiv = parent.shadowRoot.querySelector('div');
                    const callback = function (actualMutationRecords, actualObserver) {
                        expect(actualObserver).toBe(observer);
                        expect(actualMutationRecords.length).toBe(1);
                        expect(actualMutationRecords[0].target).toBe(parentDiv);
                        expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                        expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('P');
                        resolve();
                    };
                    observer = new MutationObserver(callback);
                    observer.observe(parent.shadowRoot, observerConfig);
                    // Mutate the shadow tree of x-parent
                    parentDiv.appendChild(document.createElement('p'));
                }).then(() => {
                    const childElm = parent.shadowRoot.querySelector('x-child');
                    const childDiv = childElm.shadowRoot.querySelector('div');
                    const promise = new Promise((resolve) => {
                        const callback = function (actualMutationRecords) {
                            expect(actualMutationRecords.length).toBe(2);
                            expect(actualMutationRecords[0].target).toBe(childDiv);
                            expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                            expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('UL');
                            expect(actualMutationRecords[1].target).toBe(childDiv);
                            expect(actualMutationRecords[1].addedNodes.length).toBe(1);
                            expect(actualMutationRecords[1].addedNodes[0].tagName).toBe('OL');
                            resolve();
                        };
                        new MutationObserver(callback).observe(childElm.shadowRoot, observerConfig);
                        // Mutate the shadow tree of x-child
                        childDiv.appendChild(document.createElement('ul'));
                        childDiv.appendChild(document.createElement('ol'));
                    });
                    return promise;
                });
            });

            it('should invoke observer with correct MutationRecords when removing child nodes using innerHTML', (done) => {
                const parent = createElement('x-parent', { is: XParent });
                container.appendChild(parent);
                const parentDiv = parent.shadowRoot.querySelector('div');
                parentDiv.innerHTML = `<h3></h3><p></p>`;
                let observer;
                const callback = function (actualMutationRecords, actualObserver) {
                    expect(actualObserver).toBe(observer);
                    expect(actualMutationRecords.length).toBe(1);
                    expect(actualMutationRecords[0].target).toBe(parentDiv);
                    expect(actualMutationRecords[0].removedNodes.length).toBe(2);
                    const removedNodes = Array.prototype.slice.call(
                        actualMutationRecords[0].removedNodes,
                        0
                    );
                    // In IE11, the order of nodes removal is reverse. Sorting the records to make the result deterministic
                    removedNodes.sort((nodeA, nodeB) => {
                        return nodeA.tagName > nodeB.tagName ? 1 : -1;
                    });
                    expect(removedNodes[0].tagName).toBe('H3');
                    expect(removedNodes[1].tagName).toBe('P');
                    done();
                };
                observer = new MutationObserver(callback);
                observer.observe(parent.shadowRoot, observerConfig);
                parentDiv.innerHTML = '';
            });

            it('all observers of a given node are invoked', () => {
                const parent = createElement('x-parent', { is: XParent });
                container.appendChild(parent);
                let firstObserverCallback;
                let secondObserverCallback;
                const promise1 = new Promise((resolve) => {
                    firstObserverCallback = resolve;
                });
                const promise2 = new Promise((resolve) => {
                    secondObserverCallback = resolve;
                });
                const parentDiv = parent.shadowRoot.querySelector('div');
                const observer1 = new MutationObserver(function (
                    actualMutationRecords,
                    actualObserver
                ) {
                    expect(actualObserver).toBe(observer1);
                    expect(actualMutationRecords.length).toBe(1);
                    expect(actualMutationRecords[0].target).toBe(parentDiv);
                    expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                    expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('P');
                    firstObserverCallback();
                });
                observer1.observe(parent.shadowRoot, observerConfig);
                const observer2 = new MutationObserver(function (
                    actualMutationRecords,
                    actualObserver
                ) {
                    expect(actualObserver).toBe(observer2);
                    expect(actualMutationRecords.length).toBe(1);
                    expect(actualMutationRecords[0].target).toBe(parentDiv);
                    expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                    expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('P');
                    secondObserverCallback();
                });
                observer2.observe(parent.shadowRoot, observerConfig);

                // Mutate the shadow tree of x-parent
                parentDiv.appendChild(document.createElement('p'));

                return Promise.all([promise1, promise2]);
            });

            it('should not get notifications after disconnecting observer', () => {
                const parent = createElement('x-parent', { is: XParent });
                container.appendChild(parent);
                const parentSRSpy = jasmine.createSpy();
                const observer = new MutationObserver(parentSRSpy);
                observer.observe(parent.shadowRoot, observerConfig);
                const parentDiv = parent.shadowRoot.querySelector('div');

                // Mutate the shadow tree of x-parent
                parentDiv.appendChild(document.createElement('p'));
                // Wait for a macro task
                return waitForMutationObservedToBeInvoked().then(() => {
                    // Make sure the spy is getting called
                    expect(parentSRSpy).toHaveBeenCalledTimes(1);
                    parentSRSpy.calls.reset();
                    // disconnect and verify that spy does not get invoked after
                    observer.disconnect();
                    parentDiv.appendChild(document.createElement('ul'));
                    // Wait for a macro task
                    return waitForMutationObservedToBeInvoked().then(() => {
                        expect(parentSRSpy).not.toHaveBeenCalled();
                    });
                });
            });

            it('should return expected records when takeRecords is invoked', () => {
                const parent = createElement('x-parent', { is: XParent });
                container.appendChild(parent);
                const parentDiv = parent.shadowRoot.querySelector('div');
                const observer = new MutationObserver(() => {});
                observer.observe(parent.shadowRoot, observerConfig);
                // Mutate the shadow tree of x-parent
                parentDiv.appendChild(document.createElement('ul'));
                parentDiv.appendChild(document.createElement('ol'));
                const actualMutationRecords = observer.takeRecords();
                expect(actualMutationRecords.length).toBe(2);
                expect(actualMutationRecords[0].target).toBe(parentDiv);
                expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('UL');
                expect(actualMutationRecords[1].target).toBe(parentDiv);
                expect(actualMutationRecords[1].addedNodes.length).toBe(1);
                expect(actualMutationRecords[1].addedNodes[0].tagName).toBe('OL');
            });
        }

        it('should retarget MutationRecord for mutations directly under shadowRoot - added nodes', () => {
            const host = createElement('x-template-mutations', { is: XTemplateMutations });
            container.appendChild(host);

            const callback = function (actualMutationRecords, actualObserver) {
                expect(actualObserver).toBe(shadowRootObserver);
                expect(actualMutationRecords.length).toBe(1);
                expect(actualMutationRecords[0].target).toBe(host.shadowRoot);
                expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('DIV');
                expect(actualMutationRecords[0].removedNodes.length).toBe(0);
                expect(actualMutationRecords[0].type).toBe('childList');
            };

            const globalObserverSpy = jasmine.createSpy();
            const globalObserver = new MutationObserver(globalObserverSpy);
            globalObserver.observe(container, observerConfig);
            const hostSpy = jasmine.createSpy();
            new MutationObserver(hostSpy).observe(host, observerConfig);
            const shadowRootObserver = new MutationObserver(callback);
            shadowRootObserver.observe(host.shadowRoot, observerConfig);

            // Trigger a mutation directly under the shadowRoot
            host.addNode = true;
            return waitForMutationObservedToBeInvoked().then(() => {
                expect(globalObserverSpy).not.toHaveBeenCalled();
                expect(hostSpy).not.toHaveBeenCalled();
            });
        });

        it('should retarget MutationRecord for mutations directly under shadowRoot - removed nodes', () => {
            const host = createElement('x-template-mutations', { is: XTemplateMutations });
            container.appendChild(host);

            const callback = function (actualMutationRecords, actualObserver) {
                expect(actualObserver).toBe(shadowRootObserver);
                expect(actualMutationRecords.length).toBe(1);
                expect(actualMutationRecords[0].target).toBe(host.shadowRoot);
                expect(actualMutationRecords[0].addedNodes.length).toBe(0);
                expect(actualMutationRecords[0].removedNodes.length).toBe(1);
                expect(actualMutationRecords[0].removedNodes[0].tagName).toBe('DIV');
            };

            const globalObserverSpy = jasmine.createSpy();
            const globalObserver = new MutationObserver(globalObserverSpy);
            globalObserver.observe(container, observerConfig);
            const hostSpy = jasmine.createSpy();
            new MutationObserver(hostSpy).observe(host, observerConfig);
            const shadowRootObserver = new MutationObserver(callback);
            shadowRootObserver.observe(host.shadowRoot, observerConfig);

            // Trigger a mutation directly under the shadowRoot
            host.hideNode = true;
            return waitForMutationObservedToBeInvoked().then(() => {
                expect(globalObserverSpy).not.toHaveBeenCalled();
                expect(hostSpy).not.toHaveBeenCalled();
            });
        });
    });
    if (!process.env.NATIVE_SHADOW) {
        describe('References to mutation observers are not leaked', () => {
            let container;
            beforeEach(() => {
                container = document.createElement('div');
                document.body.appendChild(container);
            });
            it('should not leak after disconnect', () => {
                const node = document.createElement('div');
                container.appendChild(node);
                const observer = new MutationObserver(() => {});
                observer.observe(node, observerConfig);
                expect(node.$$lwcNodeObservers$$.length).toBe(1);
                observer.disconnect();
                expect(node.$$lwcNodeObservers$$.length).toBe(0);
            });

            it('should not leak after disconnect - multiple nodes', () => {
                const node1 = document.createElement('div');
                const node2 = document.createElement('div');
                container.appendChild(node1);
                container.appendChild(node2);
                const observer = new MutationObserver(() => {});
                observer.observe(node1, observerConfig);
                observer.observe(node2, observerConfig);
                expect(node1.$$lwcNodeObservers$$.length).toBe(1);
                expect(node2.$$lwcNodeObservers$$.length).toBe(1);
                observer.disconnect();
                expect(node1.$$lwcNodeObservers$$.length).toBe(0);
                expect(node2.$$lwcNodeObservers$$.length).toBe(0);
            });

            it('should not leak after disconnect - multiple observers', () => {
                const node = document.createElement('div');
                container.appendChild(node);
                const observer1 = new MutationObserver(() => {});
                const observer2 = new MutationObserver(() => {});
                observer1.observe(node, observerConfig);
                expect(node.$$lwcNodeObservers$$.length).toBe(1);
                observer2.observe(node, observerConfig);
                expect(node.$$lwcNodeObservers$$.length).toBe(2);
                observer1.disconnect();
                expect(node.$$lwcNodeObservers$$.length).toBe(1);
                observer2.disconnect();
                expect(node.$$lwcNodeObservers$$.length).toBe(0);
            });

            it('should not leak after disconnect - duplicate observe()s', () => {
                const node = document.createElement('div');
                container.appendChild(node);
                const observer = new MutationObserver(() => {});
                observer.observe(node, observerConfig);
                observer.observe(node, observerConfig);
                observer.disconnect();
                expect(node.$$lwcNodeObservers$$.length).toBe(0);
            });
        });
    }
});
