import { createElement } from 'lwc';
import LightParent from 'x/lightParent';
import ShadowParent from 'x/shadowParent';

describe('get slotted elements - shadow child', () => {
    const scenarios = [
        {
            name: 'light parent',
            Component: LightParent,
            tagName: 'x-light-parent',
        },
        {
            name: 'shadow parent',
            Component: ShadowParent,
            tagName: 'x-shadow-parent',
        },
    ];

    scenarios.forEach(({ name, Component, tagName }) => {
        it(name, () => {
            const elm = createElement(tagName, { is: Component });
            document.body.appendChild(elm);

            const child = (elm.shadowRoot || elm).querySelector('x-child');
            const slotted = (elm.shadowRoot || elm).querySelector('div');

            expect(child.callQuerySelectorAllStar()).toEqual([slotted]);
            expect(child.callQuerySelectorStar()).toBe(slotted);
            expect(child.callChildren()).toEqual([slotted]);
            expect(child.callChildNodes()).toEqual([slotted]);
        });
    });
});
