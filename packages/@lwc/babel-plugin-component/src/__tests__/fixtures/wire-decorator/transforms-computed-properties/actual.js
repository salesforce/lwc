import { wire, LightningElement } from "lwc";
import { getFoo, getBar } from "data-service";

const symbol = Symbol.for("key");
export default class Test extends LightningElement {
  @wire(getFoo, {
    [symbol]: '$prop'
  })
  wiredIdentifier;
  
  @wire(getBar, {
    ['computedStringLiteral']: '$prop',
    [123n]: '$prop',
    [321]: '$prop',
    [null]: '$prop',
    [undefined]: '$prop'
  })
  wiredPrimitives;
}
