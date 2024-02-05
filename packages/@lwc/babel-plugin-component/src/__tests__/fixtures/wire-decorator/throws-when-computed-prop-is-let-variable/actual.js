import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
let key1 = 'key1'
export default class Test extends LightningElement {
  @wire(getFoo, { [key1]: "$prop1", key2: ["fixed", "array"] })
  wiredFoo;
}
