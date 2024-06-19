import { createElement } from 'lwc';
import { ENABLE_THIS_DOT_STYLE } from 'test-utils';
import Test from 'x/test';

if (ENABLE_THIS_DOT_STYLE) {
    it('this.style should return the CSSStyleDeclaration of host element', async () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        const assertColor = async (color) => {
            expect(elm.thisDotStyle.color).toEqual(color);
            expect(elm.style.color).toEqual(color);

            await Promise.resolve();
            expect(getComputedStyle(elm).color).toBe(color || 'rgb(0, 0, 0)');
        };

        await assertColor('');

        elm.setAttribute('style', 'color: rgb(255, 0, 0)');
        await assertColor('rgb(255, 0, 0)');

        elm.thisDotStyle.color = 'rgb(0, 0, 255)';
        await assertColor('rgb(0, 0, 255)');

        elm.style.color = 'rgb(0, 128, 0)';
        await assertColor('rgb(0, 128, 0)');

        elm.thisDotStyle.setProperty('color', 'rgb(255, 255, 0)');
        await assertColor('rgb(255, 255, 0)');

        elm.style.setProperty('color', 'rgb(128, 0, 128)');
        await assertColor('rgb(128, 0, 128)');
    });
} else {
    it('this.style should be undefined for older API versions', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);

        expect(elm.style.color).toEqual('');
        let thisDotStyle;
        expect(() => {
            thisDotStyle = elm.thisDotStyle;
        }).toLogWarningDev(/only supported in API version 62 and above/);
        expect(thisDotStyle).toBeUndefined();
    });
}
