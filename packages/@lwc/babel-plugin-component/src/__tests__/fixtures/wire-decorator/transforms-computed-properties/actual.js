import { wire, LightningElement } from "lwc";
import { getFoo, getBar } from "data-service";
const key1 = Symbol.for("key");
export default class Test extends LightningElement {
  @wire(getBar, { [key1]: "$prop1", key2: ["fixed", "array"] })
  wiredBar;

  // eslint-disable-next-line no-useless-computed-key
  @wire(getFoo, { ["key1"]: "$prop1", key2: ["fixed", "array"] })
  wiredFoo;
}
