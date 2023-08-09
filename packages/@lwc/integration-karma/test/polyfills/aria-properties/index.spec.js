import { ariaPropertiesMapping, nonStandardAriaProperties } from 'test-utils';
import { __unstable__ReportingControl as reportingControl } from 'lwc';

function testAriaProperty(property, attribute) {
    describe(property, () => {
        let dispatcher;

        beforeEach(() => {
            dispatcher = jasmine.createSpy();
            reportingControl.attachDispatcher(dispatcher);
        });

        afterEach(() => {
            reportingControl.detachDispatcher();
        });

        function expectWarningIfNonStandard(callback) {
            // eslint-disable-next-line jest/valid-expect
            let expected = expect(callback);
            if (!nonStandardAriaProperties.includes(property)) {
                expected = expected.not;
            }
            expected.toLogWarningDev(
                `Error: [LWC warn]: Element <div> uses non-standard property "${property}". This will be removed in a future version of LWC. See https://sfdc.co/deprecated-aria`
            );
        }

        function expectGetterReportIfNonStandard() {
            if (nonStandardAriaProperties.includes(property)) {
                expect(dispatcher.calls.allArgs()).toEqual([
                    [
                        'NonStandardAriaReflection',
                        {
                            tagName: undefined,
                            propertyName: property,
                            isSetter: false,
                            setValueType: undefined,
                        },
                    ],
                ]);
            } else {
                expect(dispatcher).not.toHaveBeenCalled();
            }
        }

        function expectSetterReportIfNonStandard(setValueType) {
            if (nonStandardAriaProperties.includes(property)) {
                expect(dispatcher.calls.allArgs()).toEqual([
                    [
                        'NonStandardAriaReflection',
                        {
                            tagName: undefined,
                            propertyName: property,
                            isSetter: true,
                            setValueType,
                        },
                    ],
                ]);
            } else {
                expect(dispatcher).not.toHaveBeenCalled();
            }
        }

        it(`should assign property ${property} to Element prototype`, () => {
            expect(Object.prototype.hasOwnProperty.call(Element.prototype, property)).toBe(true);
        });

        it(`should return null if the value is not set`, () => {
            const el = document.createElement('div');
            expectWarningIfNonStandard(() => {
                expect(el[property]).toBe(null);
            });
            expectGetterReportIfNonStandard();
        });

        it('should return the right value from the getter', () => {
            const el = document.createElement('div');
            expectWarningIfNonStandard(() => {
                el[property] = 'foo';
            });
            expectSetterReportIfNonStandard('string');
            expect(el[property]).toBe('foo');
        });

        it('should reflect the property to the associated attribute', () => {
            const el = document.createElement('div');
            expectWarningIfNonStandard(() => {
                el[property] = 'foo';
            });
            expectSetterReportIfNonStandard('string');
            expect(el.getAttribute(attribute)).toBe('foo');
        });

        it('should reflect the attribute to the property', () => {
            const el = document.createElement('div');
            el.setAttribute(attribute, 'foo');
            let value;
            expectWarningIfNonStandard(() => {
                value = el[property];
            });
            expectGetterReportIfNonStandard();
            expect(value).toBe('foo');
        });

        // Falsy values that are treated as removing the attribute when set
        const falsyValuesThatRemove = [null];

        // Falsy values that are *not* treated as removing the attribute when set
        const falsyValuesThatDoNotRemove = [0, false, '', NaN];

        // TODO [#3284]: The spec and our polyfill are inconsistent with WebKit/Chromium on setting undefined
        // Here we detect the native WebKit/Chromium behavior and either align with that or our polyfill
        // See also: https://github.com/w3c/aria/issues/1858
        const isNative = Object.getOwnPropertyDescriptor(Element.prototype, property)
            .set.toString()
            .includes('[native code]');
        const settingUndefinedRemoves = () => {
            // This test is just in case Chromium/WebKit change their behavior, or Firefox ships their version
            const div = document.createElement('div');
            div[property] = undefined;
            return div[property] === null;
        };
        if (isNative && settingUndefinedRemoves()) {
            // Native Webkit/Chromium – setting undefined is treated the same as null
            falsyValuesThatRemove.push(undefined);
        } else {
            // Our polyfill or the current spec – setting undefined is not treated like null
            falsyValuesThatDoNotRemove.push(undefined);
        }

        const prettyPrint = (value) => (value === '' ? 'the empty string' : '' + value);

        falsyValuesThatRemove.forEach((value) => {
            it(`should remove the attribute if the property is set to ${prettyPrint(
                value
            )}`, () => {
                const el = document.createElement('div');
                el.setAttribute(attribute, 'foo');

                expectWarningIfNonStandard(() => {
                    el[property] = value;
                });
                expectSetterReportIfNonStandard(value === null ? 'null' : typeof value);
                expect(el.hasAttribute(attribute)).toBe(false);
                expect(el[property]).toBeNull();
            });
        });

        falsyValuesThatDoNotRemove.forEach((value) => {
            it(`should not remove the attribute if the property is set to ${prettyPrint(
                value
            )}`, () => {
                const el = document.createElement('div');
                el.setAttribute(attribute, 'foo');

                expectWarningIfNonStandard(() => {
                    el[property] = value;
                });
                expectSetterReportIfNonStandard(value === null ? 'null' : typeof value);
                expect(el.hasAttribute(attribute)).toBe(true);
                expect(el.getAttribute(attribute)).toBe('' + value);
                expect(el[property]).toBe('' + value);
            });
        });
    });
}

// These tests don't make sense if the global polyfill is not loaded
if (!window.lwcRuntimeFlags.DISABLE_ARIA_REFLECTION_POLYFILL) {
    for (const [ariaProperty, ariaAttribute] of Object.entries(ariaPropertiesMapping)) {
        testAriaProperty(ariaProperty, ariaAttribute);
    }
}
