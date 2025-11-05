import { createElement } from 'lwc';
import SuperSuperClass from 'x/superSuperClass';
import SuperClass from 'x/superClass';
import SubClass from 'x/subClass';

describe('api decorator with superclasses', () => {
    let superSuperClass;
    let superClass;
    let subClass;

    beforeEach(() => {
        superSuperClass = createElement('x-super-super-class', { is: SuperSuperClass });
        superClass = createElement('x-super-class', { is: SuperClass });
        subClass = createElement('x-sub-class', { is: SubClass });

        document.body.appendChild(superSuperClass);
        document.body.appendChild(superClass);
        document.body.appendChild(subClass);
    });

    const variants = ['omit', 'public', 'private'];

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.substring(1);

    for (const superSuperClassVariant of variants) {
        for (const superClassVariant of variants) {
            for (const subClassVariant of variants) {
                describe(`superSuperClassVariant=${superSuperClassVariant}, superClassVariant=${superClassVariant}, subClassVariant=${subClassVariant}`, () => {
                    const methodName = `method${capitalize(superSuperClassVariant)}${capitalize(
                        superClassVariant
                    )}${capitalize(subClassVariant)}`;

                    const testElement = (elm, expectUndefined, expectWarn) => {
                        const doTest = () => {
                            if (expectUndefined) {
                                expect(elm[methodName]).toBeUndefined();
                            } else {
                                elm[methodName]();
                            }
                        };

                        if (expectWarn) {
                            expect(() => {
                                doTest();
                            }).toLogWarningDev(
                                /Add the @api annotation to the property declaration/
                            );
                        } else {
                            expect(() => {
                                doTest();
                            }).not.toLogWarningDev();
                        }
                    };

                    it('call on subClass', () => {
                        // TODO [#3762]: components should not "inherit" @api from their superclasses
                        const expectUndefined = ![
                            subClassVariant,
                            superClassVariant,
                            superSuperClassVariant,
                        ].includes('public');
                        // TODO [#3761]: components that don't extend LightningElement should warn for missing @api
                        // These cases are very inconsistent, but this is the current behavior
                        // Basically, the warning accessor is only placed on the SuperSuperClass (because it
                        // extends from LightningElement) and is invoked for each call to the private methods
                        const expectWarn =
                            subClassVariant !== 'public' &&
                            superClassVariant !== 'public' &&
                            superSuperClassVariant === 'private';

                        testElement(subClass, expectUndefined, expectWarn);
                    });

                    it('call on superClass', () => {
                        // TODO [#3762]: components should not "inherit" @api from their superclasses
                        const expectUndefined = ![
                            superClassVariant,
                            superSuperClassVariant,
                        ].includes('public');
                        // TODO [#3761]: components that don't extend LightningElement should warn for missing @api
                        // These cases are very inconsistent, but this is the current behavior
                        const expectWarn =
                            superSuperClassVariant === 'private' && superClassVariant !== 'public';

                        testElement(superClass, expectUndefined, expectWarn);
                    });

                    it('call on superSuperClass', () => {
                        const expectUndefined = superSuperClassVariant !== 'public';
                        const expectWarn = superSuperClassVariant === 'private';

                        testElement(superSuperClass, expectUndefined, expectWarn);
                    });
                });
            }
        }
    }
});
