import { createElement, setFeatureFlagForTest } from 'lwc';

import Component from 'x/component';

describe('restriction', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });

    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('should not restrict setting innerHTML on non-portaled light DOM component', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        expect(() => {
            elm.querySelector('div').innerHTML = '<span>hello</span>';
        }).not.toLogErrorDev();
        expect(elm.querySelector('div span').textContent).toEqual('hello');
    });

    it('should restrict setting outerHTML on light DOM component', () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        expect(() => {
            elm.querySelector('div').outerHTML = 'foo';
        }).toThrowError(TypeError, 'Invalid attempt to set outerHTML on Element.');
    });
});
