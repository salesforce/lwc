import { createElement } from 'lwc';

import Parent from 'x/parent';

describe('detached rehydration', () => {
    it(`should${lwcRuntimeFlags.DISABLE_DETACHED_REHYDRATION ? ' not ' : ' '}schedule rehydration for detached nodes`, async () => {
        const parent = createElement('x-parent', { is: Parent });
        document.body.appendChild(parent);

        const children = parent.shadowRoot.querySelectorAll('x-child');
        expect(children.length).toEqual(3);
        children.forEach((child) => expect(child.called).toEqual(1));

        // Schedule child nodes for rehydration
        children[1].value = 'new value';
        children[2].value = 'new value';

        // Schedule parent node for rehydration and disconnect 2nd & 3rd children
        parent.items = [{ id: 'item1', name: 'Item 4' }];

        await Promise.resolve();

        // Use calls to the getters to determine if rehydration was processed.
        // Rehydration will invoke the tmpl function -> calls getters for values
        // Note that this means the entire diffing algo was traversed in the disconnected node
        const expectedDetachedGetterCalls = lwcRuntimeFlags.DISABLE_DETACHED_REHYDRATION ? 1 : 2;
        expect(children[0].called).toEqual(2);
        expect(children[1].called).toEqual(expectedDetachedGetterCalls);
        expect(children[2].called).toEqual(expectedDetachedGetterCalls);
    });
});
