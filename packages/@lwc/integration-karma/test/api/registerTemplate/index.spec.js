import { createElement, registerTemplate } from 'lwc';
import { LightningElement } from 'lwc';

it('should accepts a function return the same value', () => {
    const template = () => [];
    const result = registerTemplate(template);

    expect(result).toBe(template);
});

it('should throw if a component tries to use a template that is not registered', () => {
    class Test extends LightningElement {
        render() {
            return () => [];
        }
    }

    const elm = createElement('x-test', { is: Test });

    expect(() => {
        document.body.appendChild(elm);
    }).toThrowConnectedError(
        TypeError,
        /Invalid template returned by the render\(\) method on \[.*\]\./
    );
});

it('should not throw if the template is registered first', () => {
    const template = () => [];
    registerTemplate(template);

    class Test extends LightningElement {
        render() {
            return template;
        }
    }

    const elm = createElement('x-test', { is: Test });

    expect(() => {
        document.body.appendChild(elm);
    }).not.toThrowError();
});
