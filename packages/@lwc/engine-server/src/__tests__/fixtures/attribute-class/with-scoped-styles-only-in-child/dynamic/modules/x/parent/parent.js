import { LightningElement } from 'lwc';

export default class extends LightningElement {
    isUndefined = undefined;
    isNull = null;
    isFalse = false;
    isTrue = true;
    isZero = 0;
    isNegZero = -0;
    isNaN = NaN;
    isInfinity = Infinity;
    isNegInfinity = -Infinity;
    isEmptyString = "";
    isArray = ["foo", "bar"];
    isObject = {
        foo: "bar",
        baz: "quux"
    };
    isTwoClasses = 'foo bar'
    isTwoClassesWithSpaces = '   foo bar '
    isUppercase = 'FOO BaR'
    isTabs = '\tfoo\t'
    isNewlines = '\nfoo\n'
}
