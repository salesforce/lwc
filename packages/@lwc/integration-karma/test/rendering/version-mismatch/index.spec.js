import { createElement, LightningElement, registerTemplate, registerComponent } from 'lwc';
import { attachReportingControlDispatcher, detachReportingControlDispatcher } from 'test-utils';

import Component from 'x/component';
import ComponentWithProp from 'x/componentWithProp';
import ComponentWithTemplateAndStylesheet from 'x/componentWithTemplateAndStylesheet';

describe('compiler version mismatch', () => {
    describe('stamped with version number', () => {
        it('component', () => {
            expect(Component.toString()).toContain(`/*LWC compiler v${process.env.LWC_VERSION}*/`);
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
        let dispatcher;

        beforeEach(() => {
            window.__lwcResetWarnedOnVersionMismatch();
            dispatcher = jasmine.createSpy();
            attachReportingControlDispatcher(dispatcher, 'CompilerRuntimeVersionMismatch');
        });

        afterEach(() => {
            detachReportingControlDispatcher();
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
            if (process.env.NODE_ENV === 'production') {
                expect(dispatcher).not.toHaveBeenCalled();
            } else {
                expect(dispatcher.calls.allArgs()).toEqual([
                    [
                        'CompilerRuntimeVersionMismatch',
                        {
                            runtimeVersion: process.env.LWC_VERSION,
                            compilerVersion: '123.456.789',
                        },
                    ],
                ]);
            }
        });

        it('stylesheet', () => {
            function tmpl() {
                return [];
            }
            tmpl.stylesheetToken = 'x-component_component';
            tmpl.stylesheets = [
                function stylesheet() {
                    return '';
                    /*LWC compiler v123.456.789*/
                },
            ];
            registerTemplate(tmpl);
            class CustomElement extends LightningElement {}
            registerComponent(CustomElement, { tmpl });

            const elm = createElement('x-component', { is: CustomElement });

            expect(() => {
                document.body.appendChild(elm);
            }).toLogErrorDev(
                new RegExp(
                    `LWC WARNING: current engine is v${process.env.LWC_VERSION}, but stylesheet was compiled with v123.456.789`
                )
            );
            if (process.env.NODE_ENV === 'production') {
                expect(dispatcher).not.toHaveBeenCalled();
            } else {
                expect(dispatcher.calls.allArgs()).toEqual([
                    [
                        'CompilerRuntimeVersionMismatch',
                        {
                            runtimeVersion: process.env.LWC_VERSION,
                            compilerVersion: '123.456.789',
                        },
                    ],
                ]);
            }
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
            if (process.env.NODE_ENV === 'production') {
                expect(dispatcher).not.toHaveBeenCalled();
            } else {
                expect(dispatcher.calls.allArgs()).toEqual([
                    [
                        'CompilerRuntimeVersionMismatch',
                        {
                            runtimeVersion: process.env.LWC_VERSION,
                            compilerVersion: '123.456.789',
                        },
                    ],
                ]);
            }
        });
    });
});
