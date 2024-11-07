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
  isSymbol = Symbol('yolo')
  isArray = ['foo', 'bar']
  isObject = {foo: 'bar', baz: 'quux'}
  isFunction = function whoWouldDoThis() { return 'somebody, probably!' }
  isString = 'ooo eee, ooo ah ah, ting tang, walla walla, bing bang'
  isNumber = 6.02214076e23
}
