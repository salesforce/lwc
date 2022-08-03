import { wire } from "lwc";
import { getFoo } from "data-service";
export default class Test {
  @wire(getFoo, { key1: "$prop1.prop2.prop3.prop4", key2: ["fixed", "array"] })
  wiredProp;
}
