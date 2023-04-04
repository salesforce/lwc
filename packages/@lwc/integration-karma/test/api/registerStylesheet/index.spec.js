import {
    createElement,
    LightningElement,
    registerComponent,
    registerStylesheet,
    registerTemplate,
} from 'lwc';
import Test from 'x/test';

it('should accept a function and return the same value', () => {
    const stylesheet = () => '';
    const result = registerStylesheet(stylesheet);

    expect(result).toBe(stylesheet);
});

it('should throw if a component tries to use a stylesheet that is not registered', () => {
    const stylesheet = () => '';
    function tmpl() {
        return [];
    }
    tmpl.stylesheetToken = 'x-component_component';
    tmpl.stylesheets = [stylesheet];
    registerTemplate(tmpl);
    class CustomElement extends LightningElement {}
    registerComponent(CustomElement, { tmpl });

    const elm = createElement('x-component', { is: CustomElement });

    expect(() => {
        document.body.appendChild(elm);
    }).toThrowError(TypeError, 'Unexpected LWC stylesheet content.');
});

it('should not throw if a component tries to use a stylesheet that is registered', () => {
    const stylesheet = () => '';
    function tmpl() {
        return [];
    }
    tmpl.stylesheetToken = 'x-component_component';
    tmpl.stylesheets = [stylesheet];
    registerStylesheet(stylesheet);
    registerTemplate(tmpl);

    class CustomElement extends LightningElement {}
    registerComponent(CustomElement, { tmpl });

    const elm = createElement('x-component', { is: CustomElement });

    expect(() => {
        document.body.appendChild(elm);
    }).not.toThrow();
});

it('should throw if registerStylesheet is used from userland code', () => {
    expect(() => {
        const element = createElement('x-test', { is: Test });
        document.body.appendChild(element);
    }).toThrowError(TypeError);
});
