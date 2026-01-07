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
    isSymbol = Symbol('yolo');
    isArray = ['foo', 'bar'];
    isObject = { foo: 'bar', baz: 'quux' };
}
