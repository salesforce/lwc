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

                    const testElement = (elm, expectThrow) => {
                        if (expectThrow) {
                            expect(elm[methodName]).toBeUndefined();
                            expect(() => {
                                elm[methodName]();
                            }).toThrow();
                        } else {
                            elm[methodName]();
                        }
                    };

                    it('call on subClass', () => {
                        // TODO [#3762]: components should not "inherit" @api from their superclasses
                        const expectThrow = ![
                            subClassVariant,
                            superClassVariant,
                            superSuperClassVariant,
                        ].includes('public');

                        testElement(subClass, expectThrow);
                    });

                    it('call on superClass', () => {
                        // TODO [#3762]: components should not "inherit" @api from their superclasses
                        const expectThrow = ![superClassVariant, superSuperClassVariant].includes(
                            'public'
                        );

                        testElement(superClass, expectThrow);
                    });

                    it('call on superSuperClass', () => {
                        const expectThrow = superSuperClassVariant !== 'public';

                        testElement(superSuperClass, expectThrow);
                    });
                });
            }
        }
    }
});
