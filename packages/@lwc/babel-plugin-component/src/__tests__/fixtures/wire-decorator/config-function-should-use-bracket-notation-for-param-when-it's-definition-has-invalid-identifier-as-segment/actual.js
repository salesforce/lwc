import { api, wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, { key1: "$prop1.a b", key2: "$p1.p2" })
  wiredProp;
}
