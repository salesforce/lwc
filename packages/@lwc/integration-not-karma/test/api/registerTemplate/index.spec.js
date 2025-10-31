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

    const elm = createElement('c-test', { is: Test });

    const func = () => {
        document.body.appendChild(elm);
    };

    // This will throw synchronously vs asynchronously depending on native vs synthetic lifecycle,
    // unless we are running the v6 engine – then it will always throw synchronously because the component has no API
    // version, and thus defaults to the oldest (i.e. synthetic custom element lifecycle events).
    expect(func).toThrowCallbackReactionError(
        TypeError,
        /Invalid template returned by the render\(\) method on c-test/
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

    const elm = createElement('c-test', { is: Test });

    expect(() => {
        document.body.appendChild(elm);
    }).not.toThrowError();
});
