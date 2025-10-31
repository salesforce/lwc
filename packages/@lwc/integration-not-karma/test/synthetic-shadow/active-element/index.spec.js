import { createElement } from 'lwc';
import Source from 'c/source';
import Target from 'c/target';

describe.skipIf(process.env.NATIVE_SHADOW)('activeElement', () => {
    it('can call shadowRoot.activeElement on transported node with no lwc:dom=manual', async () => {
        const source = createElement('c-source', { is: Source });
        const target = createElement('c-target', { is: Target });
        document.body.appendChild(source);
        document.body.appendChild(target);
        await Promise.resolve();

        const button = source.shadowRoot.querySelector('button');

        // append directly to the element, not to some <div lwc:dom=manual> inside of it as recommended
        target.appendChild(button);

        // make active
        button.focus();

        let activeElement;

        expect(() => {
            activeElement = target.shadowRoot.activeElement;
        }).toLogErrorDev(
            /NodeOwnedBy\(\) should never be called with a node that is not a child node of/
        );

        // synthetic shadow gets this wrong when lwc:dom=manual is not used, so just assert that it exists
        expect(activeElement).not.toBeNull();
    });
});
