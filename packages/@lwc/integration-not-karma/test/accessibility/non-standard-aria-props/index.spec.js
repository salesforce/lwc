import { createElement } from 'lwc';
import Light from 'x/light';
import Shadow from 'x/shadow';
import { fn as mockFn } from '@vitest/spy';
import { nonStandardAriaProperties } from '../../../helpers/aria.js';
import {
    attachReportingControlDispatcher,
    detachReportingControlDispatcher,
} from '../../../helpers/reporting-control.js';
import { resetAlreadyLoggedMessages } from '../../../helpers/reset.js';

// This test only works if the ARIA reflection polyfill is loaded
describe.runIf(process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL)(
    'non-standard ARIA properties',
    () => {
        let dispatcher;

        beforeEach(() => {
            dispatcher = mockFn();
            attachReportingControlDispatcher(dispatcher, ['NonStandardAriaReflection']);
        });

        afterEach(() => {
            detachReportingControlDispatcher();
            resetAlreadyLoggedMessages();
        });

        nonStandardAriaProperties.forEach((prop) => {
            describe(prop, () => {
                const scenarios = [
                    { name: 'light', Ctor: Light, tagName: 'x-light' },
                    { name: 'shadow', Ctor: Shadow, tagName: 'x-shadow' },
                ];

                scenarios.forEach(({ name, Ctor, tagName }) => {
                    const inComponentWarning = `Error: [LWC warn]: Element <div> owned by <${tagName}> uses non-standard property "${prop}". This will be removed in a future version of LWC. See https://sfdc.co/deprecated-aria`;
                    const outsideComponentWarning = `Error: [LWC warn]: Element <span> uses non-standard property "${prop}". This will be removed in a future version of LWC. See https://sfdc.co/deprecated-aria`;

                    describe(name, () => {
                        let elm;

                        beforeEach(() => {
                            elm = createElement(tagName, { is: Ctor });
                            document.body.appendChild(elm);
                        });

                        it('LightningElement - inside component', () => {
                            expect(() => {
                                elm.setProp(prop, 'foo');
                                elm.getProp(prop);
                            }).not.toLogWarningDev();

                            expect(dispatcher).not.toHaveBeenCalled();
                        });

                        it('LightningElement - outside component', () => {
                            expect(() => {
                                elm[prop] = 'foo';
                                const unused = elm[prop];
                                return unused; // remove lint warning
                            }).not.toLogWarningDev();

                            expect(dispatcher).not.toHaveBeenCalled();
                        });

                        it('regular Element inside LightningElement', () => {
                            expect(() => {
                                elm.setPropOnElement(prop, 'foo');
                                elm.getPropOnElement(prop);
                            }).toLogWarningDev(inComponentWarning);

                            expect(dispatcher.mock.calls).toEqual([
                                [
                                    'NonStandardAriaReflection',
                                    {
                                        tagName,
                                        propertyName: prop,
                                        isSetter: true,
                                        setValueType: 'string',
                                    },
                                ],
                                [
                                    'NonStandardAriaReflection',
                                    {
                                        tagName,
                                        propertyName: prop,
                                        isSetter: false,
                                        setValueType: undefined,
                                    },
                                ],
                            ]);
                        });

                        it('regular Element outside LightningElement', () => {
                            const span = document.createElement('span');
                            document.body.appendChild(span);
                            expect(() => {
                                span[prop] = 'foo';
                                const unused = span[prop];
                                return unused; // remove lint warning
                            }).toLogWarningDev(outsideComponentWarning);

                            expect(dispatcher.mock.calls).toEqual([
                                [
                                    'NonStandardAriaReflection',
                                    {
                                        tagName: undefined,
                                        propertyName: prop,
                                        isSetter: true,
                                        setValueType: 'string',
                                    },
                                ],
                                [
                                    'NonStandardAriaReflection',
                                    {
                                        tagName: undefined,
                                        propertyName: prop,
                                        isSetter: false,
                                        setValueType: undefined,
                                    },
                                ],
                            ]);
                        });
                    });
                });
            });
        });
    }
);
