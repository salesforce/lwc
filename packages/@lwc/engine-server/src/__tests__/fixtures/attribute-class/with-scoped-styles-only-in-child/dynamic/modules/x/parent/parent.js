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
    isEmptyString = '';
    isArray = ['foo', 'bar'];
    isObject = {
        foo: 'bar',
        baz: 'quux',
    };
    isTwoClasses = 'foo bar';
    isTwoClassesWithSpaces = '   foo bar ';
    isUppercase = 'FOO BaR';
    isTabs = '\tfoo\t';
    isNewlines = '\nfoo\n';
    // Skipping `>` because it messes up `formatHTML()`, and the important thing is checking
    // that we are calling `htmlEscape()` in attribute mode, so checking `<` is sufficient.
    hasEscapableCharacters = `"'<&`;
}
