import { createElement, registerTemplate } from 'lwc';
import { customElementConnectedErrorListener } from 'test-utils';

import DynamicTemplate, { template1, template2 } from 'x/dynamicTemplate';
import RenderThrow from 'x/renderThrow';

function testInvalidTemplate(type, template) {
    it(`throws an error if returns ${type}`, () => {
        const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
        elm.template = template;

        // TODO [#1109]: Inconsistent error message for render lifecycle method
        // Once the error is fixed, we should add the error message to the assertion.
        expect(() => {
            document.body.appendChild(elm);
        }).toThrowConnectedError();
    });
}

testInvalidTemplate('undefined', undefined);
testInvalidTemplate('null', null);
testInvalidTemplate('string', '<h1>template</h1>');
testInvalidTemplate('object', {});

it(`logs an error if returns an invalid template`, () => {
    // Attempting to return a template that isn't generated by the LWC compiler.
    const invalidTemplate = () => {};

    const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
    elm.template = invalidTemplate;

    expect(() => {
        document.body.appendChild(elm);
    }).toThrowConnectedError(
        Error,
        /Invalid template returned by the render\(\) method on .+\. It must return an imported template \(e\.g\.: `import html from "\.\/DynamicTemplate.html"`\), instead, it has returned: .+\./,
    );
});

it(`logs an error if the returned compiled template is invalid`, () => {
    // Emulating an invalid template generated by the LWC compiler.
    const invalidTemplate = () => '<h1>template</h1>';
    registerTemplate(invalidTemplate);

    const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
    elm.template = invalidTemplate;

    expect(() => {
        document.body.appendChild(elm);
    }).toLogErrorDev(/Compiler should produce html functions that always return an array\./);
});

it('should associate the component stack when the invocation throws', () => {
    const elm = createElement('x-render-throw', { is: RenderThrow });

    const error = customElementConnectedErrorListener(() => {
        document.body.appendChild(elm);
    });

    expect(error).not.toBe(undefined);
    expect(error.message).toBe('throw in render');
    expect(error.wcStack).toBe('<x-render-throw>');
});

it('supports returning a template', () => {
    const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
    elm.template = template1;
    document.body.appendChild(elm);

    expect(elm.shadowRoot.textContent).toBe('Template 1');
});

it('supports returning different templates', () => {
    const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
    elm.template = template1;
    document.body.appendChild(elm);

    expect(elm.shadowRoot.textContent).toBe('Template 1');

    elm.template = template2;
    return Promise.resolve().then(() => {
        expect(elm.shadowRoot.textContent).toBe('Template 2');
    });
});
