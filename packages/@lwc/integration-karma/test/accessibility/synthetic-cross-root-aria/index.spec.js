import { createElement, __unstable__ReportingControl as reportingControl } from 'lwc';
import AriaContainer from 'x/ariaContainer';
import Valid from 'x/valid';

// Should be kept in sync with the enum ReportId in reporting.ts
const ReportId = {
    CrossRootAriaInSyntheticShadow: 0,
};

const expectedMessage =
    'Error: [LWC warn]: Element <input> uses attribute "aria-labelledby" to reference element <label>, which is not in the same shadow root. This will break in native shadow DOM. For details, see: https://lwc.dev/guide/accessibility#link-ids-and-aria-attributes-from-different-templates\n<x-aria-source>';
const expectedMessageWithTargetAsVM =
    'Error: [LWC warn]: Element <input> uses attribute "aria-labelledby" to reference element <label>, which is not in the same shadow root. This will break in native shadow DOM. For details, see: https://lwc.dev/guide/accessibility#link-ids-and-aria-attributes-from-different-templates\n<x-aria-target>';
const expectedMessageForSecondTarget =
    'Error: [LWC warn]: Element <input> uses attribute "aria-labelledby" to reference element <div>, which is not in the same shadow root. This will break in native shadow DOM. For details, see: https://lwc.dev/guide/accessibility#link-ids-and-aria-attributes-from-different-templates\n<x-aria-source>';

// These tests are designed to detect non-standard cross-root ARIA usage in synthetic shadow DOM
// As for COMPAT, this detection logic is only enabled for modern browsers
if (!process.env.NATIVE_SHADOW && !process.env.COMPAT) {
    describe('synthetic shadow cross-root ARIA', () => {
        let dispatcher;

        beforeEach(() => {
            dispatcher = jasmine.createSpy();
            reportingControl.attachDispatcher(dispatcher);
        });

        afterEach(() => {
            reportingControl.detachDispatcher();
        });

        describe('detection', () => {
            let elm;
            let sourceElm;
            let targetElm;

            beforeEach(() => {
                elm = createElement('x-aria-container', { is: AriaContainer });
                document.body.appendChild(elm);
                sourceElm = elm.shadowRoot.querySelector('x-aria-source');
                targetElm = elm.shadowRoot.querySelector('x-aria-target');
            });

            [false, true].forEach((usePropertyAccess) => {
                describe(usePropertyAccess ? 'property' : 'attribute', () => {
                    beforeEach(() => {
                        elm.usePropertyAccess = usePropertyAccess;
                        return Promise.resolve();
                    });

                    it('setting aria-labelledby', () => {
                        expect(() => {
                            elm.linkUsingAriaLabelledBy();
                        }).toLogWarningDev(expectedMessage);
                        expect(dispatcher).toHaveBeenCalledWith(
                            ReportId.CrossRootAriaInSyntheticShadow,
                            'x-aria-source',
                            jasmine.any(Number)
                        );
                    });

                    it('setting id', () => {
                        expect(() => {
                            elm.linkUsingId();
                        }).toLogWarningDev(expectedMessage);
                        expect(dispatcher).toHaveBeenCalledWith(
                            ReportId.CrossRootAriaInSyntheticShadow,
                            'x-aria-source',
                            jasmine.any(Number)
                        );
                    });

                    it('linking to an element in global light DOM', () => {
                        const label = document.createElement('label');
                        label.id = 'foo';
                        document.body.appendChild(label);
                        expect(() => {
                            sourceElm.setAriaLabelledBy('foo');
                        }).toLogWarningDev(expectedMessage);
                        expect(dispatcher).toHaveBeenCalledWith(
                            ReportId.CrossRootAriaInSyntheticShadow,
                            'x-aria-source',
                            jasmine.any(Number)
                        );
                    });

                    it('linking from an element in global light DOM', () => {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.setAttribute('aria-labelledby', 'foo');
                        document.body.appendChild(input);
                        expect(() => {
                            targetElm.setId('foo');
                        }).toLogWarningDev(expectedMessageWithTargetAsVM);
                        expect(dispatcher).toHaveBeenCalledWith(
                            ReportId.CrossRootAriaInSyntheticShadow,
                            'x-aria-target',
                            jasmine.any(Number)
                        );
                    });

                    [null, '', '  '].forEach((value) => {
                        it(`ignores setting id to ${JSON.stringify(value)}`, () => {
                            targetElm.setId(value);
                            expect(dispatcher).not.toHaveBeenCalled();
                        });

                        it(`ignores setting aria-labelledby to ${JSON.stringify(value)}`, () => {
                            sourceElm.setAriaLabelledBy(value);
                            expect(dispatcher).not.toHaveBeenCalled();
                        });
                    });

                    it('ignores id that references nonexistent element', () => {
                        sourceElm.setAriaLabelledBy('does-not-exist-at-all-lol');
                        expect(dispatcher).not.toHaveBeenCalled();
                    });

                    [
                        {},
                        { specialChars: true },
                        { reverseOrder: true },
                        { reverseOrder: true, specialChars: true },
                        { addWhitespace: true },
                        { addWhitespace: true, reverseOrder: true },
                    ].forEach((options) => {
                        describe(`${JSON.stringify(options)}`, () => {
                            it('setting both id and aria-labelledby', () => {
                                expect(() => {
                                    elm.linkUsingBoth(options);
                                }).toLogWarningDev(expectedMessage);
                                expect(dispatcher).toHaveBeenCalledWith(
                                    ReportId.CrossRootAriaInSyntheticShadow,
                                    'x-aria-source',
                                    jasmine.any(Number)
                                );
                            });

                            it('linking multiple targets', () => {
                                expect(() => {
                                    elm.linkUsingBoth({ ...options, multipleTargets: true });
                                }).toLogWarningDev([
                                    expectedMessage,
                                    expectedMessageForSecondTarget,
                                ]);
                                expect(dispatcher).toHaveBeenCalledTimes(2);
                                expect(dispatcher.calls.allArgs()).toEqual([
                                    [
                                        ReportId.CrossRootAriaInSyntheticShadow,
                                        'x-aria-source',
                                        jasmine.any(Number),
                                    ],
                                    [
                                        ReportId.CrossRootAriaInSyntheticShadow,
                                        'x-aria-source',
                                        jasmine.any(Number),
                                    ],
                                ]);
                            });
                        });
                    });
                });
            });
        });

        [false, true].forEach((reverseOrder) => {
            describe(`reverseOrder: ${reverseOrder}`, () => {
                it('ignores valid usage', () => {
                    const valid = createElement('x-valid', { is: Valid });
                    document.body.appendChild(valid);
                    valid.linkElements({ reverseOrder });
                    expect(dispatcher).not.toHaveBeenCalled();
                });
            });
        });
    });
}
