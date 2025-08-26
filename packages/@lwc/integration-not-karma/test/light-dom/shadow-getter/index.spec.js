import { createElement, LightningElement } from 'lwc';

import Test from 'x/test';

describe('Light DOM shadow getter', () => {
    it('should render properly', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).toBeNull();
        expect(elm.firstChild.innerText).toEqual('Hello, Light DOM');
    });

    it('renderMode should be undefined for LightningElement', () => {
        expect(LightningElement.renderMode).toBeUndefined();
    });

    it('shadow should not override LightningElement.renderMode', () => {
        class Base extends LightningElement {}
        Base.renderMode = 'light';
        class Test extends Base {}
        Test.renderMode = 'shadow';
        expect(LightningElement.renderMode).toBeUndefined();
        expect(Base.renderMode).toEqual('light');
        expect(Test.renderMode).toEqual('shadow');
    });
});
