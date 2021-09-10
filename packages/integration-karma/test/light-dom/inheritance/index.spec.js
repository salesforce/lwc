import { createElement } from 'lwc';

import ShadowExtendsLight from 'x/shadowExtendsLight';
import DefaultExtendsLight from 'x/defaultExtendsLight';
import LightExtendsShadow from 'x/lightExtendsShadow';
import DefaultExtendsShadow from 'x/defaultExtendsShadow';

describe('light/shadow inheritance from base classes', () => {
    const testCases = [
        { tag: 'x-shadow-extends-light', is: ShadowExtendsLight, shadow: true },
        { tag: 'x-default-extends-light', is: DefaultExtendsLight, shadow: false },
        { tag: 'x-light-extends-shadow', is: LightExtendsShadow, shadow: false },
        { tag: 'x-default-extends-shadow', is: DefaultExtendsShadow, shadow: true },
    ];

    for (const { tag, is, shadow } of testCases) {
        it(`renders ${is.name}`, () => {
            const elm = createElement(tag, { is });
            document.body.appendChild(elm);
            if (shadow) {
                expect(elm.shadowRoot).not.toBeNull();
            } else {
                expect(elm.shadowRoot).toBeNull();
            }
        });
    }
});
