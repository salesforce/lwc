import { createElement, __unstable__ReportingControl as reportingControl } from 'lwc';
import { ReportingEventId, nonStandardAriaProperties } from 'test-utils';
import Light from 'x/light';
import Shadow from 'x/shadow';

// This test only works if the ARIA reflection polyfill is loaded
if (!window.lwcRuntimeFlags.DISABLE_ARIA_REFLECTION_POLYFILL) {
    describe('non-standard ARIA properties', () => {
        let dispatcher;

        beforeEach(() => {
            dispatcher = jasmine.createSpy();
            reportingControl.attachDispatcher(dispatcher);
        });

        afterEach(() => {
            reportingControl.detachDispatcher();
        });

        nonStandardAriaProperties.forEach((prop) => {
            describe(prop, () => {
                const scenarios = [
                    { name: 'light', Ctor: Light, tagName: 'x-light' },
                    { name: 'shadow', Ctor: Shadow, tagName: 'x-shadow' },
                ];

                scenarios.forEach(({ name, Ctor, tagName }) => {
                    const inComponentWarning = `Error: [LWC warn]: Element <div> owned by <${tagName}> uses non-standard property "${prop}". This will be removed in a future version of LWC. See https://lwc.dev/guide/accessibility#deprecated-aria-reflected-properties`;
                    const outsideComponentWarning = `Error: [LWC warn]: Element <span> uses non-standard property "${prop}". This will be removed in a future version of LWC. See https://lwc.dev/guide/accessibility#deprecated-aria-reflected-properties`;

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

                            expect(dispatcher).toHaveBeenCalledTimes(2);
                            expect(dispatcher.calls.allArgs()).toEqual([
                                [
                                    ReportingEventId.NonStandardAriaReflection,
                                    {
                                        tagName,
                                        propertyName: prop,
                                        isSetter: true,
                                        setValueType: 'string',
                                    },
                                ],
                                [
                                    ReportingEventId.NonStandardAriaReflection,
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

                            expect(dispatcher).toHaveBeenCalledTimes(2);
                            expect(dispatcher.calls.allArgs()).toEqual([
                                [
                                    ReportingEventId.NonStandardAriaReflection,
                                    {
                                        tagName: undefined,
                                        propertyName: prop,
                                        isSetter: true,
                                        setValueType: 'string',
                                    },
                                ],
                                [
                                    ReportingEventId.NonStandardAriaReflection,
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
    });
}
