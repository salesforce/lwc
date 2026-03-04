import { createElement, LightningElement, registerTemplate, registerComponent } from 'lwc';

import Component from 'x/component';
import ComponentWithProp from 'x/componentWithProp';
import ComponentWithTemplateAndStylesheet from 'x/componentWithTemplateAndStylesheet';
import { fn as mockFn } from '@vitest/spy';
import {
    attachReportingControlDispatcher,
    detachReportingControlDispatcher,
} from '../../../helpers/reporting-control.js';
import { resetWarnedOnVersionMismatch } from '../../../helpers/reset.js';

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
            resetWarnedOnVersionMismatch();
            dispatcher = mockFn();
            attachReportingControlDispatcher(dispatcher, 'CompilerRuntimeVersionMismatch');
        });

        afterEach(() => {
            process.env.SKIP_LWC_VERSION_MISMATCH_CHECK = 'false';
            detachReportingControlDispatcher();
        });

        it('skip warning during local dev', () => {
            process.env.SKIP_LWC_VERSION_MISMATCH_CHECK = 'true';
            // Use new Function() so SWC does not strip the embedded version comment at compile time.
            // The comment must be the last thing before the closing } so that LWC_VERSION_COMMENT_REGEX
            // (/\/\*LWC compiler v([\d.]+)\*\/\s*}/) can match it via Function.prototype.toString().
            const tmpl = new Function('return []; /*LWC compiler v123.456.789*/');

            expect(() => {
                registerTemplate(tmpl);
            }).not.toLogErrorDev(new RegExp(`LWC WARNING:`));
            expect(dispatcher).not.toHaveBeenCalled();
        });

        it('template', () => {
            // Use new Function() so SWC does not strip the embedded version comment at compile time.
            const tmpl = new Function('return []; /*LWC compiler v123.456.789*/');

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
                expect(dispatcher.mock.calls).toEqual([
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
            // Use new Function() so SWC does not strip the embedded version comment at compile time.
            tmpl.stylesheets = [new Function("return ''; /*LWC compiler v123.456.789*/")];
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
                expect(dispatcher.mock.calls).toEqual([
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
            // deliberately using a function rather than a class so @lwc/babel-plugin-component doesn't add a comment.
            // Use new Function() so SWC does not strip the embedded version comment at compile time.
            // The function body only needs to match LWC_VERSION_COMMENT_REGEX for the test assertion;
            // the actual constructor behaviour is irrelevant here.
            const CustomElement = new Function('/*LWC compiler v123.456.789*/');
            // Assign a name for error messages (Function constructor creates anonymous functions)
            Object.defineProperty(CustomElement, 'name', { value: 'CustomElement' });

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
                expect(dispatcher.mock.calls).toEqual([
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
