import { createElement, setFeatureFlagForTest } from 'lwc';

import Multi from 'x/multi';

describe('multiple templates', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });

    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });

    it('can render multiple templates with different styles', () => {
        const element = createElement('x-multi', { is: Multi });

        document.body.appendChild(element);

        expect(element.querySelector('div').textContent).toEqual('a');
        expect(getComputedStyle(element.querySelector('div')).color).toEqual('rgb(233, 150, 122)');
        expect(getComputedStyle(element.querySelector('div')).textDecorationLine).toEqual('none');
        element.querySelector('div').setAttribute('foo', '');
        element.next();
        return new Promise((resolve) => requestAnimationFrame(() => resolve())).then(() => {
            expect(element.querySelector('div').textContent).toEqual('b');
            expect(getComputedStyle(element.querySelector('div')).color).toEqual('rgb(0, 0, 0)');
            expect(getComputedStyle(element.querySelector('div')).textDecorationLine).toEqual(
                'underline'
            );
            // element should not be dirty after template change
            expect(element.querySelector('div').hasAttribute('foo')).toEqual(false);
        });
    });
});
