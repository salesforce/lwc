import { createElement, setFeatureFlagForTest } from 'lwc';
import Test from 'x/test';

if (!process.env.COMPAT) {
    describe('scoped-ids', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_PREFER_NATIVE_SHADOW', true);
        });
        afterEach(() => {
            setFeatureFlagForTest('ENABLE_PREFER_NATIVE_SHADOW', false);
        });
        it('should entrust id scoping to native shadow (static)', () => {
            const elm = createElement('x-test', { is: Test });
            document.body.appendChild(elm);
            const div = elm.shadowRoot.querySelector('#shizuoka');
            expect(div).not.toBeNull();
        });

        it('should entrust id scoping to native shadow (dynamic)', () => {
            const elm = createElement('x-test', { is: Test });
            document.body.appendChild(elm);
            const div = elm.shadowRoot.querySelector('#yamanashi');
            expect(div).not.toBeNull();
        });

        it('should entrust idref scoping to native shadow (static)', () => {
            const elm = createElement('x-test', { is: Test });
            document.body.appendChild(elm);
            const input = elm.shadowRoot.querySelector('[aria-describedby="shizuoka yamanashi"]');
            expect(input).not.toBeNull();
        });

        it('should entrust idref scoping to native shadow (dynamic)', () => {
            const elm = createElement('x-test', { is: Test });
            document.body.appendChild(elm);
            const input = elm.shadowRoot.querySelector('[aria-labelledby="yamanashi shizuoka"]');
            expect(input).not.toBeNull();
        });
    });
}
