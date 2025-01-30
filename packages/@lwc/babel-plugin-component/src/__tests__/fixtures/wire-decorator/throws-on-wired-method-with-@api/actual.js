import { api, wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @api
  @wire(getFoo, { key1: "$prop1", key2: ["fixed"] })
  wiredWithApi() {}
}
