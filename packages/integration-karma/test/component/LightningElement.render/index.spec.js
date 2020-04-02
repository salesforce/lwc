import { createElement } from 'lwc';

import DynamicTemplate, { template1, template2 } from 'x/dynamicTemplate';
import ParentWithThrowingChild from 'x/parentWithThrowingChild';

function testInvalidTemplate(type, template) {
    it(`throws an error if returns ${type}`, () => {
        const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
        elm.template = template;

        // TODO [#1109]: Inconsistent error message for render lifecycle method
        // Once the error is fixed, we should add the error message to the assertion.
        expect(() => {
            document.body.appendChild(elm);
        }).toThrowGlobalError(
            Error,
            /evaluateTemplate\(\) second argument must be an imported template/
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
    }).toThrowGlobalError(
        Error,
        /Invalid template returned by the render\(\) method on .+\. It must return an imported template \(e\.g\.: `import html from "\.\/undefined.html"`\), instead, it has returned: .+\./
    );
});

it('should associate the component stack when the invocation throws', () => {
    const elm = createElement('x-child-render-throw', { is: ParentWithThrowingChild });

    document.body.appendChild(elm);

    expect(elm.error).not.toBe(undefined);
    expect(elm.error.message).toBe('throw in render');
    expect(elm.error.wcStack).toMatch('<x-render-throw>');
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

// The error in this test case happens in a Promise chain that is not within the control of the test.
// Hence the error has to be caught at the top level
if ('onunhandledrejection' in window) {
    describe('should throw error during async rehydration', () => {
        let listener;
        afterEach(() => {
            // Cleanup listener after test
            window.removeEventListener('unhandledrejection', listener);
        });
        it('should throw when render() switches a valid template with an undefined value', done => {
            const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
            elm.template = template1;
            document.body.appendChild(elm);

            elm.template = undefined;
            listener = event => {
                expect(event.reason).toMatch(
                    /Assert Violation: evaluateTemplate\(\) second argument must be an imported template instead of undefined/
                );
                done();
            };
            window.addEventListener('unhandledrejection', listener);
        });
    });
}
