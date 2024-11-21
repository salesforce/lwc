import { wire, LightningElement } from "lwc";
import { Adapter } from "x/adapter";
const symbol = Symbol.for("key");
export default class Test extends LightningElement {
  // accidentally an array expression = oops!
  @wire(Adapter, { [[symbol]]: "$prop1", key2: ["fixed", "array"] })
  wiredFoo;
}
