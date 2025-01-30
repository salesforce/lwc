import { wire, LightningElement } from "lwc";
export default class Test extends LightningElement {
  @wire(function adapter() {}, {}) wiredProp;
}
