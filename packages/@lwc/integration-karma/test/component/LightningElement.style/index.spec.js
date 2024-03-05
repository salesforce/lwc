import { createElement } from 'lwc';
import Test from 'x/test';

it (
    'should return the CSSStyleDeclaration and make the appropriate changes', 
    async () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);
    // add the element to the dom

    expect(elm.style).not.toBe(null);
    // CSSStyleDeclaration must be returned and hence not be null

    elm.style.setProperty("color", "red");
    // change the color

     await Promise.resolve();
     expect(getComputedStyle(elm).color).toBe('rgb(255, 0, 0)');
     // check if the color was actually changed
});