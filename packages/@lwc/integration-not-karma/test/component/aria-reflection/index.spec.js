import { createElement } from 'lwc';
import { ariaPropertiesMapping, extractDataIds } from 'test-utils';
import NoPropDeclared from 'x/noPropDeclared';
import PropDeclared from 'x/propDeclared';
import ApiPropDeclared from 'x/apiPropDeclared';
import TrackPropDeclared from 'x/trackPropDeclared';
import NoPropDeclaredNoSuper from 'x/noPropDeclaredNoSuper';
import PropDeclaredNoSuper from 'x/propDeclaredNoSuper';
import ApiPropDeclaredNoSuper from 'x/apiPropDeclaredNoSuper';
import TrackPropDeclaredNoSuper from 'x/trackPropDeclaredNoSuper';

describe('aria reflection', () => {
    // Test with and without a custom superclass, since we may set the property accessor differently in each case
    const variants = [
        {
            name: 'has custom superclass',
            components: {
                NoPropDeclared: {
                    tagName: 'x-no-prop-declared',
                    Ctor: NoPropDeclared,
                },
                PropDeclared: {
                    tagName: 'x-prop-declared',
                    Ctor: PropDeclared,
                },
                ApiPropDeclared: {
                    tagName: 'x-api-prop-declared',
                    Ctor: ApiPropDeclared,
                },
                TrackPropDeclared: {
                    tagName: 'x-track-prop-declared',
                    Ctor: TrackPropDeclared,
                },
            },
        },
        {
            name: 'no custom superclass',
            components: {
                NoPropDeclared: {
                    tagName: 'x-no-prop-declared-no-super',
                    Ctor: NoPropDeclaredNoSuper,
                },
                PropDeclared: {
                    tagName: 'x-prop-declared-no-super',
                    Ctor: PropDeclaredNoSuper,
                },
                ApiPropDeclared: {
                    tagName: 'x-api-prop-declared-no-super',
                    Ctor: ApiPropDeclaredNoSuper,
                },
                TrackPropDeclared: {
                    tagName: 'x-track-prop-declared-no-super',
                    Ctor: TrackPropDeclaredNoSuper,
                },
            },
        },
    ];

    const scenarios = [
        {
            name: 'No prop declared',
            componentKey: 'NoPropDeclared',
            expectAttrReflection: true,
        },
        {
            name: 'Prop declared',
            componentKey: 'PropDeclared',
            // declaring a prop in the component results in no attribute reflection
            expectAttrReflection: false,
        },
        {
            name: '@api prop declared',
            componentKey: 'ApiPropDeclared',
            // declaring a prop in the component results in no attribute reflection
            expectAttrReflection: false,
        },
        {
            name: '@track prop declared',
            componentKey: 'TrackPropDeclared',
            // declaring a prop in the component results in no attribute reflection
            expectAttrReflection: false,
        },
    ];

    scenarios.forEach(({ name: scenarioName, componentKey, expectAttrReflection }) => {
        describe(scenarioName, () => {
            variants.forEach(({ name: variantName, components }) => {
                describe(variantName, () => {
                    const { tagName, Ctor } = components[componentKey];

                    Object.entries(ariaPropertiesMapping).forEach(([propName, attrName]) => {
                        function validateAria(elm, expected) {
                            const dataIds = extractDataIds(elm);

                            // rendering the prop works
                            expect(dataIds[propName].textContent).toBe(
                                expected === null ? '' : expected
                            );

                            // the property is correct
                            expect(elm[propName]).toBe(expected);
                            expect(elm.getPropInternal(propName)).toBe(expected);

                            // the attr is reflected (if we expect that to work)
                            expect(elm.getAttribute(attrName)).toBe(
                                expectAttrReflection ? expected : null
                            );
                            expect(elm.getAttrInternal(attrName)).toBe(
                                expectAttrReflection ? expected : null
                            );
                        }

                        describe(propName, () => {
                            it('no initial value', async () => {
                                const elm = createElement(tagName, { is: Ctor });

                                document.body.appendChild(elm);

                                await Promise.resolve();
                                validateAria(elm, null);
                                expect(elm.renderCount).toBe(1);
                            });

                            it('set externally', async () => {
                                const elm = createElement(tagName, { is: Ctor });

                                // set initial prop before rendering
                                elm[propName] = 'foo';

                                document.body.appendChild(elm);

                                await Promise.resolve();
                                validateAria(elm, 'foo');
                                expect(elm.renderCount).toBe(1);

                                // mutate prop
                                elm[propName] = 'bar';

                                await Promise.resolve();
                                validateAria(elm, 'bar');
                                expect(elm.renderCount).toBe(2);

                                // remove
                                elm[propName] = null;

                                await Promise.resolve();
                                validateAria(elm, null);
                                expect(elm.renderCount).toBe(3);
                            });

                            it('set internally', async () => {
                                const elm = createElement(tagName, { is: Ctor });

                                // set initial prop before rendering
                                elm.setPropInternal(propName, 'foo');

                                document.body.appendChild(elm);

                                await Promise.resolve();
                                validateAria(elm, 'foo');
                                expect(elm.renderCount).toBe(1);

                                // mutate prop
                                elm.setPropInternal(propName, 'bar');

                                await Promise.resolve();
                                validateAria(elm, 'bar');
                                expect(elm.renderCount).toBe(2);

                                // remove
                                elm.setPropInternal(propName, null);

                                await Promise.resolve();
                                validateAria(elm, null);
                                expect(elm.renderCount).toBe(3);
                            });
                        });
                    });
                });
            });
        });
    });
});
