import { createElement, LightningElement } from 'lwc';
import Component from 'x/component';
import ComponentWithProp from 'x/componentWithProp';
import ComponentWithTemplateAndStylesheet from 'x/componentWithTemplateAndStylesheet';

// TODO [#1284]: Import this from the lwc module once we move validation from compiler to linter
const { registerTemplate, registerComponent, registerStylesheets } = LWC;

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
                function tmpl() {
                    return [];
                    /*LWC compiler v123.456.789*/
                }

                expect(() => {
                    registerTemplate(tmpl);
                }).toLogErrorDev(
                    new RegExp(
                        `LWC WARNING: current engine is v${process.env.LWC_VERSION}, but template was compiled with v123.456.789`
                    )
                );
            });

            it('stylesheet', () => {
                function tmpl() {
                    return [];
                }
                const stylesheetToken = 'x-component_component';
                const stylesheets = [
                    function stylesheet() {
                        return '';
                        /*LWC compiler v123.456.789*/
                    },
                ];
                expect(() => {
                    registerStylesheets(tmpl, stylesheetToken, stylesheets);
                }).toLogErrorDev(
                    new RegExp(
                        `LWC WARNING: current engine is v${process.env.LWC_VERSION}, but stylesheet was compiled with v123.456.789`
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

                expect(() => {
                    registerComponent(CustomElement, {
                        tmpl: template,
                    });
                }).toLogErrorDev(
                    new RegExp(
                        `LWC WARNING: current engine is v${process.env.LWC_VERSION}, but component CustomElement was compiled with v123.456.789`
                    )
                );
            });
        });
    });
}
