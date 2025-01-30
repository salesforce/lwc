import { wire, LightningElement } from "lwc";
const ID = "adapterId";
export default class Test extends LightningElement {
  @wire(ID, {}) wiredProp;
}
