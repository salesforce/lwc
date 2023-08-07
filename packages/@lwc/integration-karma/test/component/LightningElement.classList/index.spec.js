import { createElement } from 'lwc';

import XTest from 'x/test';
import XAccessDuringConstruction from 'x/accessDuringConstruction';

it('should log an error when trying to access classList during construction', () => {
    expect(() => {
        createElement('x-access-during-construction', { is: XAccessDuringConstruction });
    }).toLogErrorDev(
        /The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback\(\) instead./
    );
});

it('should return an instance of DOMTokenList', () => {
    const elm = createElement('x-test', { is: XTest });
    document.body.appendChild(elm);

    expect(elm.getClassList()).toBeInstanceOf(DOMTokenList);
});

it('should return of classed applied from the outside', () => {
    const elm = createElement('x-test', { is: XTest });
    elm.className = 'foo bar';
    document.body.appendChild(elm);

    const classList = elm.getClassList();
    expect(classList.length).toBe(2);
    expect(Array.from(classList)).toEqual(['foo', 'bar']);
});

it('should allow adding a class set outside from within the component', () => {
    const elm = createElement('x-test', { is: XTest });
    elm.className = 'bar';
    document.body.appendChild(elm);

    const classList = elm.getClassList();
    classList.add('foo');

    expect(Array.from(classList)).toEqual(['bar', 'foo']);
    expect(elm.className).toBe('bar foo');
});

it('should allow deleting a class set outside from within the component', () => {
    const elm = createElement('x-test', { is: XTest });
    elm.className = 'foo bar';
    document.body.appendChild(elm);

    const classList = elm.getClassList();
    classList.remove('foo');

    expect(Array.from(classList)).toEqual(['bar']);
    expect(elm.className).toBe('bar');
});
