import { createElement } from 'test-utils';

import DynamicTemplate, { template1, template2 } from 'x/dynamicTemplate';
import RenderThrow from 'x/renderThrow';

function testInvalidTemplate(type, template) {
    it(`throws an error if returns ${type}`, () => {
        const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
        elm.template = template;

        // TODO: Open issue to improve error message
        expect(() => {
            document.body.appendChild(elm);
        }).toThrowError(
            Error,
            /Assert Violation: evaluateTemplate\(\) second argument must be an imported template instead of .+/
        );
    });
}

testInvalidTemplate('undefined', undefined);
testInvalidTemplate('null', null);
testInvalidTemplate('string', '<h1>template</h1>');
testInvalidTemplate('object', {});

it(`throws an error if returns an invalid template`, () => {
    const invalidTemplate = () => {};

    const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
    elm.template = invalidTemplate;

    expect(() => {
        document.body.appendChild(elm);
    }).toThrowError(
        Error,
        /Invalid template returned by the render\(\) method on .+\. It must return an imported template \(e\.g\.: `import html from "\.\/undefined.html"`\), instead, it has returned: .+\./
    );
});

it('should associated the component stack when the invocation throws', () => {
    const elm = createElement('x-render-throw', { is: RenderThrow });

    let error;
    try {
        document.body.appendChild(elm);
    } catch (e) {
        error = e;
    }

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
