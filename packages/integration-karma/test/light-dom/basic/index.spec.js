import { createElement, setFeatureFlagForTest } from 'lwc';

import Test from 'x/test';
describe('Basic Light DOM', () => {
    it('should render properly', () => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).toBeNull();
        expect(elm.firstChild.innerText).toEqual('Hello, Light DOM');
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
});

describe('when flag is disabled', () => {
    it('should render to Shadow DOM', () => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBeNull();
    });
});
