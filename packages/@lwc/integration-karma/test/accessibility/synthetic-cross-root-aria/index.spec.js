import { createElement, __unstable__ReportingControl as reportingControl } from 'lwc';
import { ReportingEventId } from 'test-utils';
import AriaContainer from 'x/ariaContainer';
import Valid from 'x/valid';

const expectedMessageForCrossRoot =
    'Error: [LWC warn]: Element <input> uses attribute "aria-labelledby" to reference element <label>, which is not in the same shadow root. This will break in native shadow DOM. For details, see: https://lwc.dev/guide/accessibility#link-ids-and-aria-attributes-from-different-templates\n<x-aria-source>';
const expectedMessageForCrossRootWithTargetAsVM =
    'Error: [LWC warn]: Element <input> uses attribute "aria-labelledby" to reference element <label>, which is not in the same shadow root. This will break in native shadow DOM. For details, see: https://lwc.dev/guide/accessibility#link-ids-and-aria-attributes-from-different-templates\n<x-aria-target>';
const expectedMessageForCrossRootForSecondTarget =
    'Error: [LWC warn]: Element <input> uses attribute "aria-labelledby" to reference element <div>, which is not in the same shadow root. This will break in native shadow DOM. For details, see: https://lwc.dev/guide/accessibility#link-ids-and-aria-attributes-from-different-templates\n<x-aria-source>';
const expectedMessageForNonStandardAria =
    'Error: [LWC warn]: Element <input> owned by <x-aria-source> uses non-standard property "ariaLabelledBy". This will be removed in a future version of LWC. See https://lwc.dev/guide/accessibility#deprecated-aria-reflected-properties';

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
                const expectedMessages = [
                    ...(usePropertyAccess ? [expectedMessageForNonStandardAria] : []),
                    expectedMessageForCrossRoot,
                ];

                const expectedDispatcherCalls = [
                    ...(usePropertyAccess
                        ? [
                              [
                                  ReportingEventId.NonStandardAriaReflection,
                                  {
                                      tagName: 'x-aria-source',
                                      propertyName: 'ariaLabelledBy',
                                  },
                              ],
                          ]
                        : []),
                    [
                        ReportingEventId.CrossRootAriaInSyntheticShadow,
                        {
                            tagName: 'x-aria-source',
                            attributeName: 'aria-labelledby',
                        },
                    ],
                ];

                function expectWarningForNonStandardPropertyAccess(callback) {
                    // eslint-disable-next-line jest/valid-expect
                    let expected = expect(callback);
                    if (!usePropertyAccess) {
                        expected = expected.not;
                    }
                    expected.toLogWarningDev(
                        `Error: [LWC warn]: Element <input> owned by <x-aria-source> uses non-standard property "ariaLabelledBy". This will be removed in a future version of LWC. See https://lwc.dev/guide/accessibility#deprecated-aria-reflected-properties`
                    );
                }

                describe(usePropertyAccess ? 'property' : 'attribute', () => {
                    beforeEach(() => {
                        elm.usePropertyAccess = usePropertyAccess;
                        return Promise.resolve();
                    });

                    it('setting aria-labelledby', () => {
                        expect(() => {
                            elm.linkUsingAriaLabelledBy();
                        }).toLogWarningDev(expectedMessages);
                        expect(dispatcher.calls.allArgs()).toEqual(expectedDispatcherCalls);
                    });

                    it('setting id', () => {
                        expect(() => {
                            elm.linkUsingId();
                        }).toLogWarningDev(expectedMessages);
                        expect(dispatcher.calls.allArgs()).toEqual(expectedDispatcherCalls);
                    });

                    it('linking to an element in global light DOM', () => {
                        const label = document.createElement('label');
                        label.id = 'foo';
                        document.body.appendChild(label);
                        expect(() => {
                            sourceElm.setAriaLabelledBy('foo');
                        }).toLogWarningDev(expectedMessages);
                        expect(dispatcher.calls.allArgs()).toEqual(expectedDispatcherCalls);
                    });

                    it('linking from an element in global light DOM', () => {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.setAttribute('aria-labelledby', 'foo');
                        document.body.appendChild(input);
                        expect(() => {
                            targetElm.setId('foo');
                        }).toLogWarningDev(expectedMessageForCrossRootWithTargetAsVM);
                        expect(dispatcher.calls.allArgs()).toEqual([
                            [
                                ReportingEventId.CrossRootAriaInSyntheticShadow,
                                {
                                    tagName: 'x-aria-target',
                                    attributeName: 'aria-labelledby',
                                },
                            ],
                        ]);
                    });

                    [null, '', '  '].forEach((value) => {
                        it(`ignores setting id to ${JSON.stringify(value)}`, () => {
                            targetElm.setId(value);
                            expect(dispatcher).not.toHaveBeenCalled();
                        });

                        it(`ignores setting aria-labelledby to ${JSON.stringify(value)}`, () => {
                            expectWarningForNonStandardPropertyAccess(() => {
                                sourceElm.setAriaLabelledBy(value);
                            });
                            expect(dispatcher.calls.allArgs()).toEqual([
                                ...(usePropertyAccess
                                    ? [
                                          [
                                              ReportingEventId.NonStandardAriaReflection,
                                              {
                                                  tagName: 'x-aria-source',
                                                  propertyName: 'ariaLabelledBy',
                                              },
                                          ],
                                      ]
                                    : []),
                            ]);
                        });
                    });

                    it('ignores id that references nonexistent element', () => {
                        expectWarningForNonStandardPropertyAccess(() => {
                            sourceElm.setAriaLabelledBy('does-not-exist-at-all-lol');
                        });
                        expect(dispatcher.calls.allArgs()).toEqual([
                            ...(usePropertyAccess
                                ? [
                                      [
                                          ReportingEventId.NonStandardAriaReflection,
                                          {
                                              tagName: 'x-aria-source',
                                              propertyName: 'ariaLabelledBy',
                                          },
                                      ],
                                  ]
                                : []),
                        ]);
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
                                }).toLogWarningDev(expectedMessages);
                                expect(dispatcher.calls.allArgs()).toEqual(expectedDispatcherCalls);
                            });

                            it('linking multiple targets', () => {
                                expect(() => {
                                    elm.linkUsingBoth({ ...options, multipleTargets: true });
                                }).toLogWarningDev([
                                    ...expectedMessages,
                                    expectedMessageForCrossRootForSecondTarget,
                                ]);
                                expect(dispatcher.calls.allArgs()).toEqual([
                                    ...expectedDispatcherCalls,
                                    [
                                        ReportingEventId.CrossRootAriaInSyntheticShadow,
                                        {
                                            tagName: 'x-aria-source',
                                            attributeName: 'aria-labelledby',
                                        },
                                    ],
                                ]);
                            });
                        });
                    });
                });
            });
        });

        it('does not log duplicates warnings', () => {
            const elm1 = createElement('x-aria-container', { is: AriaContainer });
            const elm2 = createElement('x-aria-container', { is: AriaContainer });
            document.body.appendChild(elm1);
            document.body.appendChild(elm2);

            // warning is logged only once
            expect(() => {
                elm1.linkUsingBoth({ idPrefix: 'prefix-1' });
                elm2.linkUsingBoth({ idPrefix: 'prefix-2' }); // ids must be globally unique
            }).toLogWarningDev(expectedMessageForCrossRoot);

            // dispatcher is still called twice
            expect(dispatcher.calls.allArgs()).toEqual([
                [
                    ReportingEventId.CrossRootAriaInSyntheticShadow,
                    {
                        tagName: 'x-aria-source',
                        attributeName: 'aria-labelledby',
                    },
                ],
                [
                    ReportingEventId.CrossRootAriaInSyntheticShadow,
                    {
                        tagName: 'x-aria-source',
                        attributeName: 'aria-labelledby',
                    },
                ],
            ]);
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
