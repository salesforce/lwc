import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, {
    key1: "$prop",
    key2: "$prop",
    key3: "fixed",
    key4: ["fixed", "array"],
  })
  wiredProp;
}
