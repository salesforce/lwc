import { createElement, setFeatureFlagForTest } from 'lwc';

import LightContainer from 'x/lightContainer';
import ShadowContainer from 'x/shadowContainer';

describe('#2386 - Light DOM component slotted content in shadow slots', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });

    it('returns the correct elements for: light -> shadow', () => {
        const elm = createElement('x-light-container', {
            is: LightContainer,
        });
        document.body.appendChild(elm);

        const p = elm.querySelector('p');
        const slot = elm.querySelector('x-consumer').shadowRoot.querySelector('slot');

        expect(slot.assignedNodes()).toEqual([p]);
        expect(slot.assignedElements()).toEqual([p]);
    });

    it('returns the correct elements for: shadow -> light -> shadow', () => {
        const elm = createElement('x-shadow-container', {
            is: ShadowContainer,
        });
        document.body.appendChild(elm);

        const p = elm.shadowRoot.querySelector('p');
        const slot = elm.shadowRoot.querySelector('x-consumer').shadowRoot.querySelector('slot');

        expect(slot.assignedNodes()).toEqual([p]);
        expect(slot.assignedElements()).toEqual([p]);
    });
});
