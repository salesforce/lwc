import {
    createElement,
    LightningElement,
    registerComponent,
    registerStylesheet,
    registerTemplate,
    __unstable__ReportingControl as reportingControl,
} from 'lwc';

describe('registerStylesheet', () => {
    let dispatcher;

    beforeEach(() => {
        dispatcher = jasmine.createSpy();
        reportingControl.attachDispatcher(dispatcher);
    });

    afterEach(() => {
        reportingControl.detachDispatcher();
    });

    it('should accept a function and return the same value', () => {
        const stylesheet = () => '';
        const result = registerStylesheet(stylesheet);

        expect(result).toBe(stylesheet);
    });

    it('should log a warning and report if a component tries to use a stylesheet that is not registered', () => {
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
        }).toLogWarningDev(
            /\[LWC warn]: TypeError: Unexpected LWC stylesheet content found for component <x-component>./
        );

        expect(dispatcher).toHaveBeenCalled();
        expect(dispatcher.calls.argsFor(0)).toEqual([
            'UnexpectedStylesheetContent',
            {
                tagName: 'x-component',
            },
        ]);
    });

    it('should not log a warning or report if a component tries to use a stylesheet that is registered', () => {
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
        }).not.toLogError();
        expect(dispatcher).not.toHaveBeenCalled();
    });
});
