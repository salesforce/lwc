import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  // Did you know numeric literals can be used as property keys? This becomes "123"!
  @wire(getFoo, { 1.2_3e2: "$prop" })
  wiredProp;
}
