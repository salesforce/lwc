import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, {
    key1: "$prop1.prop2",
    key2: ["fixed", "array"],
    key3: "$p1.p2",
  })
  wiredProp;
}
