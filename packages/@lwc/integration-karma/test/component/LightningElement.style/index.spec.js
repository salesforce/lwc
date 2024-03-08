import { createElement } from 'lwc';
import Test from 'x/test';

fit('should return the CSSStyleDeclaration of host element via the style property', async () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm)

    const assertColor = async (color) => {
        expect(elm.thisDotStyle.color).toEqual(color);
        expect(elm.style.color).toEqual(color);

        await Promise.resolve();
        expect(getComputedStyle(elm).color).toBe(color || 'rgb(0, 0, 0)');
    }

    await assertColor('')

    elm.setAttribute('style', 'color: rgb(255, 0, 0)');
    await assertColor('rgb(255, 0, 0)')

    elm.thisDotStyle.color = 'rgb(0, 0, 255)';
    await assertColor('rgb(0, 0, 255)')

    elm.style.color = 'rgb(0, 128, 0)';
    await assertColor('rgb(0, 128, 0)')

    elm.thisDotStyle.setProperty('color', 'rgb(255, 255, 0)')
    await assertColor('rgb(255, 255, 0)')

    elm.style.setProperty('color', 'rgb(128, 0, 128)')
    await assertColor('rgb(128, 0, 128)')
});
