import { createElement } from 'lwc';
import Test from 'x/test';

it(
    'should return the CSSStyleDeclaration and make the appropriate changes', 
    () => {
    const elm = createElement('x-test', { is: Test });
    expect(elm.style).not.toBe(null);
    // CSSStyleDeclaration must be returned and hence not be null
    elm.style.color = "red";
    expect(elm.style.color).toEqual("red");
     // checks whether the color is changed or not
});