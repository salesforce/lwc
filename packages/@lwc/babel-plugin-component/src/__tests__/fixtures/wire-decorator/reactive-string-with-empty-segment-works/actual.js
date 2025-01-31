import { api, wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, { key1: "$prop1..prop2", key2: ["fixed", "array"] })
  wiredProp;
}
