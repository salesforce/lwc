import { createElement } from 'lwc';

import Component from 'x/component';
import IdenticalComponent from 'x/identicalComponent';
import Sharing1 from 'x/sharing1';
import Sharing2 from 'x/sharing2';

// This test makes no sense for browsers that don't support constructable stylesheets
// or for synthetic shadow
if (process.env.NATIVE_SHADOW && document.adoptedStyleSheets) {
    describe('stylesheets', () => {
        it('re-uses constructable stylesheets for instances of the same component', () => {
            const elm1 = createElement('x-component', { is: Component });
            const elm2 = createElement('x-component', { is: Component });

            document.body.appendChild(elm1);
            document.body.appendChild(elm2);

            expect(elm1.shadowRoot.adoptedStyleSheets.length).toEqual(1);
            expect(elm2.shadowRoot.adoptedStyleSheets.length).toEqual(1);
            expect(elm1.shadowRoot.adoptedStyleSheets[0]).toBe(
                elm2.shadowRoot.adoptedStyleSheets[0]
            );
        });

        it('re-uses constructable stylesheets for components with identical styles', () => {
            const elm1 = createElement('x-component', { is: Component });
            const elm2 = createElement('x-identical-component', { is: IdenticalComponent });

            document.body.appendChild(elm1);
            document.body.appendChild(elm2);

            expect(elm1.shadowRoot.adoptedStyleSheets.length).toEqual(1);
            expect(elm2.shadowRoot.adoptedStyleSheets.length).toEqual(1);
            expect(elm1.shadowRoot.adoptedStyleSheets[0]).toBe(
                elm2.shadowRoot.adoptedStyleSheets[0]
            );
        });

        it('re-uses constructable stylesheets for components with shared style', () => {
            const elm1 = createElement('x-sharing1', { is: Sharing1 });
            const elm2 = createElement('x-sharing2', { is: Sharing2 });

            document.body.appendChild(elm1);
            document.body.appendChild(elm2);

            // imported style is the same, but after the import they're different
            expect(elm1.shadowRoot.adoptedStyleSheets.length).toEqual(2);
            expect(elm2.shadowRoot.adoptedStyleSheets.length).toEqual(2);
            expect(elm1.shadowRoot.adoptedStyleSheets[0]).toBe(
                elm2.shadowRoot.adoptedStyleSheets[0]
            );
            expect(elm1.shadowRoot.adoptedStyleSheets[1]).not.toBe(
                elm2.shadowRoot.adoptedStyleSheets[1]
            );
        });
    });
}
