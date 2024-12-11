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
    test1 = 'color: red !important ';
    test2 = 'color: red !important ;';
    test3 = 'color: red  !important ';
    test4 = 'color: red  !important ;';
    test5 = 'color: red ! important;';
    test6 = 'color: red ! important';
    test7 = 'color: red !IMPORTANT ';
    test8 = '  color  :  red  !  IMPORTANT  ;  ';
    test9 = 'color: red;';
    test10 = 'color: red; background-color: aqua  ';
    test11 = 'color: red ; background-color: aqua; ';
    test12 = '  --its-a-tab:	red    ;  ';
    test13 = '  --its-a-tab-and-a-space:	 red    ;  ';
    test14 = '   ';
}
