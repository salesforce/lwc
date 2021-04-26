import { createElement, setFeatureFlagForTest, LightningElement } from 'lwc';

import Test from 'x/test';

describe('Light DOM shadow getter', () => {
    it('should render properly', () => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).toBeNull();
        expect(elm.firstChild.innerText).toEqual('Hello, Light DOM');
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });

    it('shadow should be true for LightningElement', () => {
        expect(LightningElement.shadow).toEqual(true);
    });

    it('shadow should not override LightningElement.shadow', () => {
        class Base extends LightningElement {}
        Base.shadow = false;
        class Test extends Base {}
        Test.shadow = true;
        expect(LightningElement.shadow).toEqual(true);
        expect(Base.shadow).toEqual(false);
        expect(Test.shadow).toEqual(true);
    });
});
