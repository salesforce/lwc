import { createElement } from 'test-utils';
import parent from 'x/parent';
import slottedChild from 'x/slottedChild';
import nestedSlotContainer from 'x/nestedSlotContainer';

const observerConfig = { childList: true, subtree: true };

describe('MutationObserver is synthetic shadow dom aware.', () => {
    describe('mutations do not leak shadow boundary', ()=> {
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

        it('global observer should be called 1 time, when the root element is attached to document', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            return Promise.resolve()
                .then(() => {
                    expect(globalObserverSpy).toHaveBeenCalledTimes(1);
                });
        });

        it('global observer is not called when mutations occur inside shadow tree', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            return Promise.resolve()
                .then(() => {
                    // The first call will be when x-parent is appended to the container
                    globalObserverSpy.calls.reset();

                    // Mutate the shadow tree of x-parent
                    const parentDiv = root.shadowRoot.querySelector('div');
                    parentDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
                    expect(globalObserverSpy).not.toHaveBeenCalled();

                    // Mutate the shadow tree of x-child
                    const childElm = root.shadowRoot.querySelector('x-child');
                    const childDiv = childElm.shadowRoot.querySelector('div');
                    childDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
                    expect(globalObserverSpy).not.toHaveBeenCalled();
                });
        });

        it('global observer is not called when mutations occur in slotted content', () => {
            const root = createElement('x-slotted-child', { is: slottedChild });
            container.appendChild(root);
            return Promise.resolve()
                .then(() => {
                    // The first call will be when x-slotted-child is appended to the container
                    globalObserverSpy.calls.reset();
                    const slottedDiv = root.shadowRoot.querySelector('div.manual');
                    slottedDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
                    expect(globalObserverSpy).not.toHaveBeenCalled();
                });
        });

        it('should invoke observer on root when slotted content is altered', () => {
            const root = createElement('x-slotted-child', { is: slottedChild });
            container.appendChild(root);

            // Start observing the parent and child shadow trees
            const parentSRSpy = jasmine.createSpy();
            new MutationObserver(parentSRSpy).observe(root.shadowRoot, observerConfig);
            const childSRSpy = jasmine.createSpy();
            new MutationObserver(childSRSpy).observe(root.shadowRoot.querySelector('x-child').shadowRoot, observerConfig);
            
            return Promise.resolve()
                .then(() => {
                    const slottedDiv = root.shadowRoot.querySelector('div.manual');
                    slottedDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
                    // observer on the slot receiver should not see mutation
                    expect(childSRSpy).not.toHaveBeenCalled();
                    // observer on root element's shadowRoot will be notified
                    // because the slot content being mutated belongs to that shadow tree
                    expect(parentSRSpy).toHaveBeenCalledTimes(1);
                });
        });

        it('should invoke observer on slot content owner', () => {
            const root = createElement('x-nested-slot-container', { is: nestedSlotContainer } );
            container.appendChild(root);

            // Start observing the parent and child shadow trees
            // x-nested-slot-container
            const parentSRSpy = jasmine.createSpy();
            new MutationObserver(parentSRSpy).observe(root.shadowRoot, observerConfig);
            // x-nested-slot
            const childSRSpy = jasmine.createSpy();
            const child = root.shadowRoot.querySelector('x-nested-slot');
            new MutationObserver(childSRSpy).observe(child.shadowRoot, observerConfig);
            // x-child
            const grandChildSRSpy = jasmine.createSpy();
            const grandChild = child.shadowRoot.querySelector('x-child');
            new MutationObserver(grandChildSRSpy).observe(grandChild.shadowRoot, observerConfig);
            // x-child > slot
            const grandChildSlotSpy = jasmine.createSpy();
            const grandChildSlot = grandChild.shadowRoot.querySelector('slot');
            new MutationObserver(grandChildSlotSpy).observe(grandChildSlot, observerConfig);

            return Promise.resolve()
                .then(() => {
                    const slottedDiv = grandChild.querySelector('div.manual'); // query from light dom
                    slottedDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
                    // observers on the slot receiver should not see mutation
                    expect(childSRSpy).not.toHaveBeenCalled();
                    expect(grandChildSRSpy).not.toHaveBeenCalled();
                    expect(grandChildSlotSpy).not.toHaveBeenCalled();
                    // observer on root element's shadowRoot will be notified
                    // because the slot content being mutated belongs to that shadow tree
                    expect(parentSRSpy).toHaveBeenCalledTimes(1);
                });
        });

        it('parent observer not invoked when mutations occur in a nested lwc', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);

            // Start observing the parent and child shadow trees
            const parentSpy = jasmine.createSpy();
            new MutationObserver(parentSpy).observe(root.shadowRoot, observerConfig);
            return Promise.resolve()
                .then(() => {
                    const childElm = root.shadowRoot.querySelector('x-child');
                    const childDiv = childElm.shadowRoot.querySelector('div');
                    childDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
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

        it('should invoke observer with correct MutationRecords when adding child nodes using appendChild', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            return new Promise((resolve)=>{
                    let observer;
                    const parentDiv = root.shadowRoot.querySelector('div');
                    const callback = function(actualMutationRecords, actualObserver) {
                        expect(actualObserver).toBe(observer);
                        expect(actualMutationRecords.length).toBe(1);
                        expect(actualMutationRecords[0].target).toBe(parentDiv);
                        expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                        expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('P');
                        resolve();
                    };
                    observer = new MutationObserver(callback);
                    observer.observe(root.shadowRoot, observerConfig);
                    // Mutate the shadow tree of x-parent
                    parentDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
                    const childElm = root.shadowRoot.querySelector('x-child');
                    const childDiv = childElm.shadowRoot.querySelector('div');
                    const promise = new Promise((resolve)=>{
                        const callback = function(actualMutationRecords) {
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

        it('should invoke observer with correct MutationRecords when adding child nodes using innerHTML', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            return new Promise((resolve) =>{
                    let observer;
                    const parentDiv = root.shadowRoot.querySelector('div');
                    const callback = function(actualMutationRecords, actualObserver) {
                        expect(actualObserver).toBe(observer);
                        expect(actualMutationRecords.length).toBe(1);
                        expect(actualMutationRecords[0].target).toBe(parentDiv);
                        expect(actualMutationRecords[0].addedNodes.length).toBe(2);
                        expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('TABLE');
                        expect(actualMutationRecords[0].addedNodes[1].tagName).toBe('P');
                        resolve();
                    };
                    observer = new MutationObserver(callback);
                    observer.observe(root.shadowRoot, observerConfig);
                    // Mutate the shadow tree of x-parent
                    parentDiv.innerHTML = `<table><thead></thead><tr></tr></table><p>`;
                });
        });

        it('should invoke observer with correct MutationRecords when removing child nodes using innerHTML', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            const parentDiv = root.shadowRoot.querySelector('div');
            parentDiv.innerHTML = `<table><thead></thead><tr></tr></table><p>`;
            return new Promise((resolve) => {
                    let observer;
                    const callback = function(actualMutationRecords, actualObserver) {
                        expect(actualObserver).toBe(observer);
                        expect(actualMutationRecords.length).toBe(1);
                        expect(actualMutationRecords[0].target).toBe(parentDiv);
                        expect(actualMutationRecords[0].removedNodes.length).toBe(2);
                        expect(actualMutationRecords[0].removedNodes[0].tagName).toBe('TABLE');
                        expect(actualMutationRecords[0].removedNodes[1].tagName).toBe('P');
                        resolve();
                    };
                    observer = new MutationObserver(callback);
                    observer.observe(root.shadowRoot, observerConfig);
                    parentDiv.innerHTML = '';
                });
        });

        xit('should return expected records when takeRecords is invoked', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            const parentDiv = root.shadowRoot.querySelector('div');
            const observer = new MutationObserver(() => {});
            observer.observe(root.shadowRoot, observerConfig);
            return Promise.resolve()
                .then(() => {
                    // Mutate the shadow tree of x-parent
                    parentDiv.appendChild(document.createElement('ul'));
                    parentDiv.appendChild(document.createElement('ol'));
                })
                .then(() => {
                    const actualMutationRecords = observer.takeRecords();
                    expect(actualMutationRecords.length).toBe(2);
                    expect(actualMutationRecords[0].target).toBe(childDiv);
                    expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                    expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('UL');
                    expect(actualMutationRecords[1].target).toBe(childDiv);
                    expect(actualMutationRecords[1].addedNodes.length).toBe(1);
                    expect(actualMutationRecords[1].addedNodes[0].tagName).toBe('OL');
                });
        });

        it('should not get notifications after disconnecting observer', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            const parentSRSpy = jasmine.createSpy();
            const observer = new MutationObserver(parentSRSpy);
            observer.observe(root.shadowRoot, observerConfig);
            const parentDiv = root.shadowRoot.querySelector('div');

            return Promise.resolve()
                .then(() => {
                    // Mutate the shadow tree of x-parent
                    parentDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
                    // Make sure the spy is getting called
                    expect(parentSRSpy).toHaveBeenCalledTimes(1);
                    parentSRSpy.calls.reset();
                    // disconnect and verify that spy does not get invoked after
                    observer.disconnect()
                    parentDiv.appendChild(document.createElement('ul'));
                })
                .then(() => {
                    expect(parentSRSpy).not.toHaveBeenCalled();
                });

        });

        it('all observers of a given node are invoked', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            let firstObserverCallback;
            let secondObserverCallback;
            const promise1 = new Promise((resolve) => {
                firstObserverCallback = resolve;
            });
            const promise2 = new Promise((resolve) => {
                secondObserverCallback = resolve;
            });

            const parentDiv = root.shadowRoot.querySelector('div');
            const observer1 = new MutationObserver(function(actualMutationRecords, actualObserver) {
                expect(actualObserver).toBe(observer1);
                expect(actualMutationRecords.length).toBe(1);
                expect(actualMutationRecords[0].target).toBe(parentDiv);
                expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('P');
                firstObserverCallback();
            });
            observer1.observe(root.shadowRoot, observerConfig);
            const observer2 = new MutationObserver(function(actualMutationRecords, actualObserver) {
                expect(actualObserver).toBe(observer2);
                expect(actualMutationRecords.length).toBe(1);
                expect(actualMutationRecords[0].target).toBe(parentDiv);
                expect(actualMutationRecords[0].addedNodes.length).toBe(1);
                expect(actualMutationRecords[0].addedNodes[0].tagName).toBe('P');
                secondObserverCallback();
            });
            observer2.observe(root.shadowRoot, observerConfig);
 
            // Mutate the shadow tree of x-parent
            parentDiv.appendChild(document.createElement('p'));

            return Promise.all([promise1, promise2]);
        })
    });
});
