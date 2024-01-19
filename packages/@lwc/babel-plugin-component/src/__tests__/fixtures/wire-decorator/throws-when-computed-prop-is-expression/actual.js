import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
const symbol = Symbol.for("key");
export default class Test extends LightningElement {
  // accidentally an array expression = oops!
  @wire(getFoo, { [[symbol]]: "$prop1", key2: ["fixed", "array"] })
  wiredFoo;
}
