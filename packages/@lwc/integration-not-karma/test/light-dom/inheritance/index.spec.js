import { createElement } from 'lwc';

import ShadowExtendsLight from 'c/shadowExtendsLight';
import DefaultExtendsLight from 'c/defaultExtendsLight';
import LightExtendsShadow from 'c/lightExtendsShadow';
import DefaultExtendsShadow from 'c/defaultExtendsShadow';

describe('light/shadow inheritance from base classes', () => {
    const testCases = [
        { tag: 'c-shadow-extends-light', is: ShadowExtendsLight, shadow: true },
        { tag: 'c-default-extends-light', is: DefaultExtendsLight, shadow: false },
        { tag: 'c-light-extends-shadow', is: LightExtendsShadow, shadow: false },
        { tag: 'c-default-extends-shadow', is: DefaultExtendsShadow, shadow: true },
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
