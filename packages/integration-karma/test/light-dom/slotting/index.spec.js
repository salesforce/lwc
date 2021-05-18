import { createElement, setFeatureFlagForTest } from 'lwc';

import Slotted from 'x/slotted';
import Container from 'x/container';

describe('slotted content', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });

    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });

    it('should throw when attempting to render a slotted content in the light DOM', () => {
        const element = createElement('x-slotted', { is: Slotted });

        expect(() => {
            document.body.appendChild(element);
        }).toThrowError(
            /Invalid usage of <x-container>\. Light DOM components don't support slotting yet\./
        );
    });
});

describe('imperative slotted content', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });

    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });

    [
        ['Node.prototype.insertBefore', (elm) => elm.insertBefore(document.createElement('div'))],
        ['Node.prototype.appendChild', (elm) => elm.appendChild(document.createElement('div'))],
        [
            'Node.prototype.replaceChild',
            (elm) => elm.replaceChild(elm.firstChild, document.createElement('div')),
        ],
    ].forEach(([operation, fn]) => {
        it(`throws an error when invoking ${operation}`, () => {
            const element = createElement('x-container', { is: Container });
            document.body.appendChild(element);

            expect(() => {
                fn(element);
            }).toThrowError(
                /Invalid DOM operation on <x-container>\. Light DOM component don't allow imperative slotted content\./
            );
        });
    });
});
