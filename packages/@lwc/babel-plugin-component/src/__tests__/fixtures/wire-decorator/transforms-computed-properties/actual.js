import { wire, LightningElement } from "lwc";
import { getSmart } from "data-service";

const symbol = Symbol.for("key");
export default class Test extends LightningElement {
  @wire(getSmart, {
    staticIdentifier: 'regular value',
    'staticLiteral': 'regular value',
    ['computed literal can be treated like static']: 'regular value'
  })
  staticPropsRegularValues;

  @wire(getSmart, {
    staticIdentifier: '$dynamic.value',
    'staticLiteral': '$dynamic.value',
    ['computed literal can be treated like static']: '$dynamic.value'
  })
  staticPropsDynamicValues;

  @wire(getSmart, {
    [symbol /* computed identifier */]: 'regular value',
    [Symbol('computed expression')]: 'regular value'
  })
  computedPropsRegularValues;

  @wire(getSmart, {
    [symbol /* computed identifier */]: '$dynamic.value',
    [Symbol('computed expression')]: '$dynamic.value'
  })
  computedPropsDynamicValues;
  
  @wire(getSmart, {
    identifier: '$dynamic',
    regular: 'is regular',
    'string': 'regular',
    'dynamic': '$dynamic',
    1.2_3e+2: true, // parsed as numeric literal, i.e. `123`
    ['computedNotDynamic']: 'hello',
    ['computedStringLiteral']: '$prop',
    [1234n]: '$prop',
    [321]: '$prop',
    [null]: '$prop',
    [undefined]: '$prop',
    [Math.random()]: Math.random(),
    [{toString:Date.now}]: '$when',
    [`${Date.now()}`]: 'now',
    // methods / spread should be ignored but preserved
    get foo() {},
    set bar(v) {},
    method() {},
    ...({spread: true})
  })
  mixedAndEdgeCases;
}
