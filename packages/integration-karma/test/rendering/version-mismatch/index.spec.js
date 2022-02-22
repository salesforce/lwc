import { createElement, LightningElement } from 'lwc';
import DynamicTemplate from 'x/dynamicTemplate';
import DynamicTemplate2 from 'x/dynamicTemplate2';
import Component from 'x/component';
import ComponentWithProp from 'x/componentWithProp';
import ComponentWithTemplateAndStylesheet from 'x/componentWithTemplateAndStylesheet';

// TODO [#1284]: Import this from the lwc module once we move validation from compiler to linter
const { registerTemplate, registerComponent, registerDecorators } = LWC;

if (!process.env.COMPAT) {
    describe('compiler version mismatch', () => {
        describe('stamped with version number', () => {
            it('component', () => {
                expect(Component.toString()).toContain(
                    `/*LWC compiler v${process.env.LWC_VERSION}*/`
                );
            });

            it('component with prop', () => {
                expect(ComponentWithProp.toString()).toContain(
                    `/*LWC compiler v${process.env.LWC_VERSION}*/`
                );
            });

            it('template', () => {
                const elm = createElement('x-component-with-template-and-stylesheet', {
                    is: ComponentWithTemplateAndStylesheet,
                });

                expect(elm.template.toString()).toContain(
                    `/*LWC compiler v${process.env.LWC_VERSION}*/`
                );
            });

            it('stylesheet', () => {
                const elm = createElement('x-component-with-template-and-stylesheet', {
                    is: ComponentWithTemplateAndStylesheet,
                });

                expect(elm.template.stylesheets[0].toString()).toContain(
                    `/*LWC compiler v${process.env.LWC_VERSION}*/`
                );
            });
        });

        describe('version mismatch warning', () => {
            beforeEach(() => {
                window.__lwcResetWarnedOnVersionMismatch();
            });

            it('template', () => {
                const invalidTemplate = function () {
                    return [];
                    /*LWC compiler v123.456.789*/
                };
                registerTemplate(invalidTemplate);

                const elm = createElement('x-dynamic-template', { is: DynamicTemplate });
                elm.template = invalidTemplate;

                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    new RegExp(
                        `LWC WARNING: current engine is v${process.env.LWC_VERSION}, but <x-dynamic-template> was compiled with v123.456.789`
                    )
                );
            });

            it('stylesheet', () => {
                const invalidTemplate = function () {
                    return [];
                };
                invalidTemplate.stylesheetToken = 'x-component_component';
                invalidTemplate.stylesheets = [
                    function () {
                        return '';
                        /*LWC compiler v123.456.789*/
                    },
                ];
                registerTemplate(invalidTemplate);

                const elm = createElement('x-dynamic-template-2', { is: DynamicTemplate2 });
                elm.template = invalidTemplate;

                expect(() => {
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    new RegExp(
                        `LWC WARNING: current engine is v${process.env.LWC_VERSION}, but <x-dynamic-template-2> was compiled with v123.456.789`
                    )
                );
            });

            it('component', () => {
                // deliberately using a function rather than a class so @lwc/babel-plugin-component doesn't add a comment
                function CustomElement() {
                    return LightningElement.apply(this, arguments);
                    /*LWC compiler v123.456.789*/
                }

                Object.setPrototypeOf(CustomElement, LightningElement);

                const template = function () {
                    return [];
                };
                registerTemplate(template);

                registerDecorators(CustomElement, {});

                const Ctor = registerComponent(CustomElement, {
                    tmpl: template,
                });

                expect(() => {
                    const elm = createElement('x-component', { is: Ctor });
                    document.body.appendChild(elm);
                }).toLogErrorDev(
                    new RegExp(
                        `LWC WARNING: current engine is v${process.env.LWC_VERSION}, but CustomElement was compiled with v123.456.789`
                    )
                );
            });
        });
    });
}
