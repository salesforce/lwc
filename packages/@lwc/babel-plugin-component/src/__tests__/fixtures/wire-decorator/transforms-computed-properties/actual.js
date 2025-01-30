import { wire, LightningElement } from "lwc";
import { getFoo, getBar } from "data-service";

const symbol = Symbol.for("key");
export default class Test extends LightningElement {
  @wire(getFoo, {
    [symbol]: '$prop'
  })
  wiredIdentifier;
  
  @wire(getBar, {
    identifier: '$yay',
    regular: 'is regular',
    'string': 'a string',
    'dynamic': '$woot',
    4_5_6: true,
    ['computedNotDynamic']: 'hello',
    ['computedStringLiteral']: '$prop',
    [123n]: '$prop',
    [321]: '$prop',
    [null]: '$prop',
    [Math.random()]: Math.random(),
    [undefined]: '$prop',
    get foo() {},
    set bar(v){}
  })
  wiredPrimitives;
}
