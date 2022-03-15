import { wire } from "lwc";
import { getFoo } from "data-service";
export default class Test {
  @wire(getFoo, {
    key1: "$prop",
    key2: "$prop",
    key3: "fixed",
    key4: ["fixed", "array"],
  })
  wiredProp;
}
