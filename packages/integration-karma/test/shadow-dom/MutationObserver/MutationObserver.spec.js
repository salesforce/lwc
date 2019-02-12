import { createElement } from 'test-utils';
import parent from 'x/parent';
import slottedChild from 'x/slottedChild';

describe('MutationObserver is synthetic shadow dom aware', () => {
    const observerConfig = { childList: true, subtree: true };
    describe('mutations do not leak shadow boundary', ()=> {
        let globalObserverSpy;
        let container; 
        beforeEach(() => {
            globalObserverSpy = jasmine.createSpy();
            // globalObserverSpy = (mutationList, observer) => {debugger;mutationList;observer;};
            const globalObserver = new MutationObserver(globalObserverSpy);
            container = document.createElement('div');
            document.body.appendChild(container);
            // Attach to container node instead of document or body to not affect other tests
            globalObserver.observe(container, observerConfig);
        });

        xit('global observer should be called 1 time, when the root element is attached to document', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            return Promise.resolve()
                .then(() => {
                    expect(globalObserverSpy).toHaveBeenCalledTimes(1);
                });
        });

        xit('global observer is not called when mutations occur inside shadow tree', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            return Promise.resolve() // TODO: Read PM's comment in waitForStyleToBeApplied()
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

        it('should invoke observer in parent when slotted content is altered', () => {
            const root = createElement('x-slotted-child', { is: slottedChild });
            container.appendChild(root);

            // Start observing the parent and child shadow trees
            const parentSpy = jasmine.createSpy();
            new MutationObserver(parentSpy).observe(root.shadowRoot, observerConfig);
            const childSpy = jasmine.createSpy();
            new MutationObserver(childSpy).observe(root.shadowRoot.querySelector('x-child'), observerConfig);
            
            return Promise.resolve()
                .then(() => {
                    const slottedDiv = root.shadowRoot.querySelector('div.manual');
                    slottedDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
                    expect(childSpy).not.toHaveBeenCalled();
                    expect(parentSpy).toHaveBeenCalledTimes(1);
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
    describe('should invoke observer with correct MutationRecord[]', () => {
        
    });
});

/**
 * Tests to add
 * 1. Verify that disconnect() works
 * 2. Verify that takeRecords() works
 */
