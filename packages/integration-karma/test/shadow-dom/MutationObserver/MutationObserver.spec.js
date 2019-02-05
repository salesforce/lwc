import { createElement } from 'test-utils';
import parent from 'x/parent';
import child from 'x/child';

describe('MutationObserver is synthetic shadow dom aware', () => {
    const observerConfig = { childList: true, subtree: true };
    describe('mutations do not leak shadow boundary', ()=> {
        let globalObserverSpy;
        let container; 
        beforeEach(() => {
            // globalObserverSpy = jasmine.createSpy();
            globalObserverSpy = (mutationList, observer) => {debugger;mutationList;observer;};
            const globalObserver = new MutationObserver(globalObserverSpy);
            container = document.createElement('div');
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

        it('global observer is not called when mutations occur inside shadow tree', () => {
            const root = createElement('x-parent', { is: parent });
            container.appendChild(root);
            return Promise.resolve()
                .then(() => {
                    // globalObserverSpy.calls.reset();
                    const parentDiv = root.shadowRoot.querySelector('div');
                    parentDiv.appendChild(document.createElement('p'));
                })
                .then(() => {
                    expect(globalObserverSpy).not.toHaveBeenCalled();
                });
        });
    })
});
